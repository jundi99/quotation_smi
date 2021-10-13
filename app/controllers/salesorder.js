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
const { SendEmailProcessed } = require('./quotation')

joi.objectId = require('joi-objectid')(joi)

const CreateSO = async (salesOrder, body) => {
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

    SendEmailProcessed(customer, salesOrder)
    await Quotation.updateOne({ quoNo: salesOrder.quoNo }, body, { new: true })

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
      attachmentPO: joi.string().optional().allow(null),
      isConfirm: joi.boolean().required(),
      status: joi.string().default('Processed'),
    })
    .validateAsync(body)

  const salesOrder = await Quotation.findOne({ quoNo: body.quoNo })
    .populate('salesman')
    .lean()

  if (salesOrder) {
    CreateSO(salesOrder, body)
  }

  return salesOrder
}

const GenerateCreditLimitPassword = async () => {
  const dataPassword = await Password.findOne({
    quoNo: { $exists: false },
  }).lean()

  if (dataPassword?.password) {
    return dataPassword?.password
  }
  const generateNewPassword = Math.floor(100000 + Math.random() * 900000) // generate 6 digit
  const password = await Password.findOneAndUpdate(
    { quoNo: { $exists: false } },
    { password: generateNewPassword },
    { new: true, upsert: true },
  ).lean()

  return password.password
}

const ValidatePasswordCredit = async (body) => {
  const { quoNo, password } = await joi
    .object({
      quoNo: joi.string().required(),
      password: joi
        .string()
        .required()
        .error(() => {
          throw new StandardError('Password yang anda masukkan tidak terdaftar')
        }),
    })
    .validateAsync(body)

  const data = await Password.findOne({
    $or: [
      { quoNo: { $exists: false }, password },
      { quoNo: quoNo, password },
    ],
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
