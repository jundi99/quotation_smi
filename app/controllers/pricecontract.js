const {
  SMIModels: { PriceContract },
} = require('../daos')
const joi = require('joi')
const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const { JwtSign } = require('../utils')
const {
  StatusMessage: { FAIL },
} = require('../constan')

joi.objectId = require('joi-objectid')(joi)

const GetPriceContracts = async (query) => {
  const { skip, limit } = await joi
    .object({
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const [priceContracts, total] = await Promise.all([
    PriceContract.find({})
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .deepPopulate(['detail.item'])
      .lean(),
    PriceContract.countDocuments(),
  ])

  return { priceContracts, total }
}

const GetPriceContract = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.objectId().required(),
    })
    .validateAsync(body)
  const priceContract = await PriceContract.findOne({ _id }).lean()

  return priceContract
}

const UpsertPriceContract = async (body) => {
  body = await joi
    .object({
      _id: joi.objectId().optional(),
      customerNames: joi.array().items(joi.string()).required(),
      contractPrice: joi.boolean().default(false),
      priceType: joi.string().optional(),
      startAt: joi.date(),
      endAt: joi.date(),
      note: joi.string().optional(),
      fileXLS: joi.string().optional(),
      detail: joi
        .array()
        .items(
          joi.object({
            item: joi.objectId().required(),
            qtyPack: joi.number(),
            sellPrice: joi.number(),
            moreQty: joi.number(),
            lessQty: joi.number(),
            equalQty: joi.number(),
          }),
        )
        .optional(),
    })
    .validateAsync(body)
  const { _id } = body
  let newData

  if (!_id) {
    newData = await new PriceContract(body).save()
  } else {
    newData = await PriceContract.findOneAndUpdate({ _id }, body, {
      new: true,
      upsert: true,
    }).lean()
  }

  return newData
}

const DeletePriceContract = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.objectId().required(),
    })
    .validateAsync(body)
  const dataDeleted = await PriceContract.delete({ _id })

  return dataDeleted
}

const GetPriceTypes = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/price-type`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(user.bypass ? { bypass: true } : { Authorization: `${token}` }),
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { data: [], message: FAIL }
  }

  return { data: await dataFina.json(), message: FAIL }
}

module.exports = {
  GetPriceContracts,
  GetPriceContract,
  UpsertPriceContract,
  DeletePriceContract,
  GetPriceTypes,
}
