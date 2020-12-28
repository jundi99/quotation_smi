const {
  SMIModels: { Quotation },
} = require('../daos')
const joi = require('joi')

joi.objectId = require('joi-objectid')(joi)

const GetQuotations = async (query) => {
  const { skip, limit, itemNo, itemName } = await joi
    .object({
      itemNo: joi.string().optional(),
      itemName: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const [quotations, total] = await Promise.all([
    Quotation.find({
      ...(itemNo ? { itemNo: new RegExp(itemNo, 'gi') } : {}),
      ...(itemName ? { itemName: new RegExp(itemName, 'gi') } : {}),
    })
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .deepPopulate(['customer'])
      .lean(),
    Quotation.countDocuments(),
  ])

  return { quotations, total }
}

const UpsertQuotation = async (body) => {
  body = await joi
    .object({
      customer: joi.objectId().required(),
      quoNo: joi.string().required(),
      quoDate: joi.date().required(),
      deliveryDate: joi.date().required(),
      payment: joi.string().required(),
      delivery: joi.string().required(),
      detail: joi
        .array()
        .items(
          joi.object({
            itemNo: joi.string().required(),
            itemName: joi.string().required(),
            qtyPack: joi.number().required(),
            quantity: joi.number().required(),
            price: joi.number().required(),
            amount: joi.number().required(),
            status: joi.string().required(),
          }),
        )
        .required(),
    })
    .validateAsync(body)
  const newData = await Quotation.findOneAndUpdate(
    { quoNo: body.quoNo },
    body,
    { new: true, upsert: true },
  ).lean()

  return newData
}

const DeleteQuotation = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.objectId().required(),
    })
    .validateAsync(body)
  const dataDeleted = await Quotation.delete({ _id })

  return dataDeleted
}

const GetQuotation = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.string().required(),
    })
    .validateAsync(body)
  const quotation = await Quotation.findOne({ _id }).lean()

  return quotation
}

module.exports = {
  GetQuotations,
  GetQuotation,
  UpsertQuotation,
  DeleteQuotation,
}
