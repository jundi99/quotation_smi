const joi = require('joi')
const {
  SMIModels: { Quotation, Password, Customer },
} = require('../daos')
const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const {
  StatusMessage: { SUCCESS, FAIL },
} = require('../constants')
const StandardError = require('../../utils/standard_error')
const { log } = console
const { EmailToDev } = require('../utils/helper')

joi.objectId = require('joi-objectid')(joi)

const CreateSO = async (salesOrder) => {
  try {
    Reflect.deleteProperty(salesOrder, 'attachmentPO')
    const { personNo } = salesOrder
    const customer = await Customer.findOne({ personNo })
      .populate('salesman')
      .lean()

    salesOrder.customerId = customer.customerId
    salesOrder.isCreateNewCustomer = !customer.customerId
    if (salesOrder.isCreateNewCustomer) {
      salesOrder.customer = customer
    }
    const dataFina = await fetch(
      normalizeUrl(`${FINA_SMI_URI}/fina/create-so`),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          bypass: true,
        },
        body: JSON.stringify(salesOrder),
      },
    ).catch((err) => {
      return { fail: true, err }
    })

    if (dataFina.fail || dataFina.ok === false) {
      return { message: FAIL }
    }
    const data = await dataFina.json()

    if (data.customerId) {
      await Customer.updateOne({ personNo }, { customerId: data.customerId })
    }

    return { data, message: SUCCESS }
  } catch (error) {
    log('CreateSO:', error)
    EmailToDev('CreateSO', { error, param: salesOrder })

    return error
  }
}

const UpdateSO = async (body) => {
  body = await joi
    .object({
      quoNo: joi.string().required(),
      attachmentPO: joi.string().optional(),
      isConfirm: joi.boolean().required(),
      status: joi.string().default('Processed'),
    })
    .validateAsync(body)

  const salesOrder = await Quotation.findOneAndUpdate(
    { quoNo: body.quoNo },
    body,
    { new: true },
  )
    .populate('salesman')
    .lean()

  if (salesOrder) {
    CreateSO(salesOrder)
  }

  return salesOrder
}

const GenerateCreditLimitPassword = async () => {
  const password = await Password.findOneAndUpdate(
    { quoNo: { $exists: false } },
    {},
    { new: true, upsert: true },
  ).lean()

  return password._id
}

const ValidatePasswordCredit = async (body) => {
  const { quoNo, password } = await joi
    .object({
      quoNo: joi.string().required(),
      password: joi
        .objectId()
        .required()
        .error(() => {
          throw new StandardError('Password yang anda masukkan tidak terdaftar')
        }),
    })
    .validateAsync(body)

  const data = await Password.findOne({
    _id: password,
    $or: [{ quoNo: { $exists: false } }, { quoNo: quoNo }],
  })

  if (!data) {
    throw new StandardError('Password yang anda masukkan tidak terdaftar')
  }

  try {
    data.quoNo = quoNo
    await data.save()
  } catch (error) {
    log(error)
    throw new StandardError('Quotation sudah pernah dipakai')
  }

  return data._id
}

module.exports = {
  UpdateSO,
  GenerateCreditLimitPassword,
  ValidatePasswordCredit,
}
