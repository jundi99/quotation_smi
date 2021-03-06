const {
  SMIModels: { ItemCategory, Item, Customer, PriceContract },
} = require('../daos')
const joi = require('joi')

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
  const { skip, limit, itemNo, name } = await joi
    .object({
      itemNo: joi.string().optional(),
      name: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
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
    { personNo: user.personNo },
    { category: 1 },
  )
    .deepPopulate(['category'])
    .lean()

  let priceContract = await PriceContract.findOne(
    {
      contractPrice: true,
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
      $or: [
        { personNos: user.personNo },
        {
          priceType:
            categoryCust && categoryCust.category
              ? categoryCust.category.name
              : 'NA',
        },
      ],
    },
    { 'details.itemNo': 1, 'details.sellPrice': 1 },
  ).lean()

  if (!priceContract) {
    priceContract = await PriceContract.findOne(
      {
        contractPrice: false,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
        priceType:
          categoryCust && categoryCust.category
            ? categoryCust.category.name
            : 'NA',
      },
      { 'details.itemNo': 1, 'details.sellPrice': 1 },
    ).lean()
  }

  items = items.map((item) => {
    const pricefromContract = priceContract
      ? priceContract.details.find((pc) => pc.itemNo === item.itemNo)
      : false

    if (pricefromContract) {
      item.price = pricefromContract.sellPrice
    } else {
      item.price = item.price ? item.price.level1 || 0 : 0
    }
    item.qtyPerPack = 1
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

module.exports = {
  GetItemCategories,
  GetItemsQuo,
  GetStatusItem,
}
