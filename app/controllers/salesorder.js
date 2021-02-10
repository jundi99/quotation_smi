const joi = require('joi')
const {
  SMIModels: { Quotation },
} = require('../daos')
const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const {
  StatusMessage: { SUCCESS, FAIL },
} = require('../constants')

const CreateSO = async (salesOrder) => {
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
      customerId: joi.number().required(),
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

module.exports = {
  UpdateSO,
}
