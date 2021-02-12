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

const CreateSO = async (salesOrder) => {
  const { personNo } = salesOrder
  const customer = await Customer.findOne({ personNo }).lean()

  salesOrder.customerId = customer.customerId
  salesOrder.isCreateNewCustomer = !customer.customerId
  const dataFina = await fetch(normalizeUrl(`${FINA_SMI_URI}/fina/create-so`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      bypass: true,
    },
    body: JSON.stringify(salesOrder),
  }).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }
  const data = await dataFina.json()

  return data
}

const UpdateSO = async (body) => {
  body = await joi
    .object({
      personNo: joi.string().required(),
      quoNo: joi.string().required(),
      attachmentPO: joi.string().optional(),
      isConfirm: joi.boolean().required(),
    })
    .validateAsync(body)

  const salesOrder = await Quotation.findOneAndUpdate(
    { quoNo: body.quoNo },
    body,
    { new: true },
  ).lean()

  CreateSO(salesOrder)

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
      password: joi.string().required(),
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
