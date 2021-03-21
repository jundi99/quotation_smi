/* eslint-disable max-lines-per-function */
const {
  SMIModels: { ItemCategory, Item, Customer, PriceContract },
} = require('../daos')
const joi = require('joi')
const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')

const GetItemCategories = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)

  const itemCategories = await ItemCategory.find({
    $or: [{ name: new RegExp(q, 'gi') }],
  })
    .sort({ categoryId: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return itemCategories
}

const GetItemsQuo = async (query, user) => {
  const { skip, limit, itemNo, name, personNo } = await joi
    .object({
      itemNo: joi.string().optional(),
      personNo: joi.string().optional(),
      name: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(25),
    })
    .validateAsync(query)

  const queryItem = {
    ...(itemNo ? { itemNo: new RegExp(itemNo, 'gi') } : {}),
    ...(name ? { name: new RegExp(name, 'gi') } : {}),
  }
  let items = await Item.find(queryItem)
    .sort({ _id: -1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  const categoryCust = await Customer.findOne(
    { personNo: personNo ? personNo : user.personNo },
    { category: 1 },
  )
    .deepPopulate(['category'])
    .lean()

  let priceContracts = await PriceContract.find(
    {
      isContract: true,
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
      $or: [
        { personNos: personNo ? personNo : user.personNo },
        {
          priceType:
            categoryCust && categoryCust.category
              ? categoryCust.category.name
              : 'NA',
        },
      ],
    },
    { details: 1 },
  )
    .sort({ _id: -1 })
    .lean()

  if (priceContracts.length === 0) {
    priceContracts = await PriceContract.find(
      {
        isContract: false,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
        priceType:
          categoryCust && categoryCust.category
            ? categoryCust.category.name
            : 'NA',
      },
      { details: 1 },
    )
      .sort({ _id: -1 })
      .lean()
  }

  const allPriceContracts = []

  priceContracts.map((pc) => allPriceContracts.push(...pc.details))

  items = items.map((item) => {
    const pricefromContract = allPriceContracts.length
      ? allPriceContracts
          .filter((pc) => pc.itemNo === item.itemNo)
          .sort((a, b) => {
            return a.lessQty ? a.lessQty - b.lessQty : 0 // asc
          })
      : false

    if (pricefromContract.length) {
      item.price = pricefromContract[0].sellPrice
      item.priceContracts = pricefromContract.sort((a, b) => {
        return a.lessQty ? b.lessQty - a.lessQty : 0 // desc
      })
      item.qtyPack = pricefromContract[0].qtyPack
    } else {
      item.price = item.price ? item.price.level1 || 0 : 0
      item.qtyPack = 1
    }

    item.availableStock =
      item.stockSMI + item.stockSupplier > 20 ? '> 20' : '< 20'

    return item
  })

  return items
}

const GetStatusItem = async (body) => {
  const { itemNo, quantity } = await joi
    .object({
      itemNo: joi.string().required(),
      quantity: joi.number().required(),
    })
    .validateAsync(body)

  const item = await Item.findOne({ itemNo }).lean()
  const totalStock = item.stockSMI + item.stockSupplier
  let status = 'Ready'

  if (quantity > item.stockSMI && quantity <= totalStock) {
    status = 'H+1'
  } else if (quantity > totalStock) {
    status = 'Indent'
  }

  return status
}

const UpdateStockSupplierXls = async (fileName) => {
  let dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/check-item-excel`),
    {
      method: 'POST',
      body: JSON.stringify({
        fileName,
      }),
      headers: {
        'Content-Type': 'application/json',
        bypass: true,
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    throw new Error('Gagal update stock supplier')
  }

  dataFina = await dataFina.json()

  const { rows } = dataFina

  rows.shift()

  const doSyncUpload = async (data) => {
    const { itemNo, stockSupplier } = data

    const isItemExist = await Item.findOne({ itemNo }).lean()

    if (isItemExist) {
      return Item.updateOne({ itemNo }, { stockSupplier })
    }

    return new Item(data).save()
  }

  rows.map((row) => {
    const data = {
      itemNo: row[0],
      name: row[1],
      unit: row[2],
      stockSupplier: row[3],
    }

    doSyncUpload(data)

    return true
  })

  return 'OK'
}

module.exports = {
  GetItemCategories,
  GetItemsQuo,
  GetStatusItem,
  UpdateStockSupplierXls,
}
