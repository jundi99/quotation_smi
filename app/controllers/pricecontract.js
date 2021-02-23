const {
  SMIModels: { PriceContract, RunningNumber },
} = require('../daos')
const joi = require('joi')
const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const { JwtSign } = require('../utils')
const {
  StatusMessage: { SUCCESS, FAIL },
} = require('../constants')
const _ = require('lodash')
const numeral = require('numeral')
const moment = require('moment')

const GetPriceContracts = async (query) => {
  const { skip, limit } = await joi
    .object({
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const [priceContracts, total] = await Promise.all([
    PriceContract.find({})
      .sort({ priceConNo: 1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    PriceContract.countDocuments(),
  ])

  return { priceContracts, total }
}

const GetPriceContract = async (body) => {
  const { priceConNo } = await joi
    .object({
      priceConNo: joi.string().required(),
    })
    .validateAsync(body)
  const priceContract = await PriceContract.findOne({ priceConNo }).lean()

  return priceContract
}

const runningPriceConNo = async () => {
  const number = await RunningNumber.findOne({}, { priceConNo: 1 })
  const formatDate = moment().format('YYYYMMDD')
  const formatNum = (num) => numeral(num).format('00000000')
  let priceConNo

  if (number) {
    priceConNo = number.priceConNo
      ? formatNum(Number(number.priceConNo) + 1)
      : formatNum(1)
    number.priceConNo = priceConNo

    await number.save()
  } else {
    priceConNo = formatNum(1)
    await new RunningNumber({ priceConNo }).save()
  }
  priceConNo = `PRI/${formatDate}/${priceConNo}`

  return priceConNo
}

const UpsertPriceContract = async (body) => {
  body = await joi
    .object({
      priceConNo: joi.string().optional(),
      customerNames: joi.array().items(joi.string()).required(),
      contractPrice: joi.boolean().default(false),
      priceType: joi.string().optional(),
      startAt: joi.date(),
      endAt: joi.date(),
      note: joi.string().optional(),
      fileXLS: joi.string().optional(),
      details: joi
        .array()
        .items(
          joi.object({
            itemNo: joi.string().required(),
            itemName: joi.string().required(),
            unit: joi.string(),
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
  const { priceConNo } = body
  let newData = await PriceContract.findOne({ priceConNo })

  if (priceConNo && newData) {
    newData = _.merge(newData, body)
    newData.save()
  } else {
    body.priceConNo = await runningPriceConNo()
    newData = await new PriceContract(body).save()
  }

  return newData
}

const DeletePriceContract = async (body) => {
  const { priceConNo } = await joi
    .object({
      priceConNo: joi.string().required(),
    })
    .validateAsync(body)
  const dataDeleted = await PriceContract.delete({ priceConNo })

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

  const data = await dataFina.json()

  return { ...data, message: SUCCESS }
}

module.exports = {
  GetPriceContracts,
  GetPriceContract,
  UpsertPriceContract,
  DeletePriceContract,
  GetPriceTypes,
}
