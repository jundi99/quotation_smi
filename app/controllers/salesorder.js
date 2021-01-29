const joi = require('joi')
const {
  SMIModels: { Quotation },
} = require('../daos')

const UpdateSO = async (body) => {
  body = await joi
    .object({
      customerId: joi.number().required(),
      quoNo: joi.string().required(),
      attachmentPO: joi.string().required(),
      isConfirm: joi.boolean().required(),
    })
    .validateAsync(body)

  const salesOrder = await Quotation.findOneAndUpdate(
    { quoNo: body.quoNo },
    body,
    { new: true },
  ).lean()

  return salesOrder
}

module.exports = {
  UpdateSO,
}
