const {
  SMIModels: { PriceContract, RunningNumber, Customer, CustCategory },
} = require('../daos')
const joi = require('joi')
const _ = require('lodash')
const numeral = require('numeral')
const moment = require('moment')

const GetPriceContracts = async (query) => {
  const { skip, limit } = await joi
    .object({
      skip: joi.number().min(0).default(0),
      limit: joi.number().min(1).default(5),
    })
    .validateAsync(query)
  const [priceContracts, total] = await Promise.all([
    PriceContract.find({}, { details: { $slice: [0, 10] } }) // must filter array of details, because performance issue
      .sort({ priceConNo: -1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    PriceContract.countDocuments(),
  ])

  return { priceContracts, total }
}

const GetPriceContract = async (body) => {
  const { priceConNo, skip, limit } = await joi
    .object({
      priceConNo: joi.string().required(),
      skip: joi.number().min(0).default(0),
      limit: joi.number().min(1).default(10),
    })
    .validateAsync(body)
  const priceContract = await PriceContract.findOne(
    { priceConNo },
    { details: { $slice: [skip * limit, limit] } },
  ).lean()

  const totalData = await PriceContract.aggregate([
    {
      $match: {
        priceConNo,
        deleted: false,
      },
    },
    {
      $project: {
        totalDetailPriceContract: { $size: '$details' },
      },
    },
  ])

  if (priceContract) {
    let customers = await Customer.find(
      { personNo: { $in: priceContract.personNos } },
      { personNo: 1, name: 1 },
    ).lean()

    customers = customers.map((cust) => {
      cust.customerName = cust.name

      return cust
    })

    priceContract.customers = customers
  }

  priceContract.total = totalData[0]?.totalDetailPriceContract || 0

  return priceContract
}

const runningPriceConNo = async () => {
  const number = await RunningNumber.findOne({}, { priceConNo: 1 })
  const formatDate = moment().format('MMDD')
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
      personNos: joi.array().items(joi.string()).optional(),
      isContract: joi.boolean().default(false),
      priceType: joi.string().optional().allow(''),
      startAt: joi.date(),
      endAt: joi.date(),
      createdAt: joi.date(),
      note: joi.string().optional().allow(''),
      fileXLS: joi.string().optional(),
      details: joi
        .array()
        .items(
          joi.object({
            itemNo: joi.string().required(),
            itemName: joi.string().required(),
            unit: joi.string().allow(null, ''),
            qtyPack: joi.number(),
            sellPrice: joi.number(),
            moreQty: joi.number().allow(null),
            lessQty: joi.number().allow(null),
            equalQty: joi.number().allow(null),
          }),
        )
        .optional(),
    })
    .validateAsync(body)
  const { priceConNo } = body
  let newData = await PriceContract.findOne({ priceConNo }, { details: 0 })
  const details = body.details.map((det) => {
    if (det.equalQty > 0) {
      det.lessQty = null
      det.moreQty = null
    } else {
      det.equalQty = null
      det.lessQty = det.lessQty || 0
      det.moreQty = det.moreQty || 0
    }

    return det
  })

  if (priceConNo && newData) {
    if (body.personNos) {
      newData.personNos = null
    }
    newData = _.merge(newData, body)
    newData.details = null
    newData.details = details
    newData.save()
  } else {
    body.priceConNo = await runningPriceConNo()
    body.details = details
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

const GetPriceTypes = async () => {
  const custCategories = await CustCategory.find({}, { name: 1 }).lean()

  return custCategories.map((cust) => cust.name)
}

module.exports = {
  GetPriceContracts,
  GetPriceContract,
  UpsertPriceContract,
  DeletePriceContract,
  GetPriceTypes,
}
