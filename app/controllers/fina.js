const { FINA_SMI_URI } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const { JwtSign } = require('../utils')
const { NewItem, NewUser, NewCustomer } = require('../utils/helper')
const {
  SMIModels: { User, Item, ItemCategory, Customer, Salesman, Term },
} = require('../daos')
const joi = require('joi')
const {
  StatusMessage: { SUCCESS, FAIL },
} = require('../constants')

const SyncMasterItemCategory = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/sync-itemcategory`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user.bypass ? { bypass: true } : { Authorization: `${token}` }),
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }
  const { data, total } = await dataFina.json()
  const newItemCategory = (data) => {
    const newData = {
      categoryId: data.ID,
      name: data.NAME,
    }

    return newData
  }

  const doPromises = []

  data.map((fina) => {
    return doPromises.push(
      ItemCategory.findOneAndUpdate(
        { categoryId: fina.ID },
        newItemCategory(fina),
        { upsert: true, rawResult: true },
      ),
    )
  })

  const results = await Promise.all(doPromises)
  const newData = results.reduce((prev, curr) => {
    const value = curr.lastErrorObject.updatedExisting ? 0 : 1

    return prev + value
  }, 0)

  return {
    total,
    newData,
    message: SUCCESS,
  }
}

const SyncMasterItem = async (opt, user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(normalizeUrl(`${FINA_SMI_URI}/fina/sync-item`), {
    method: 'POST',
    body: JSON.stringify({
      opt,
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(user.bypass ? { bypass: true } : { Authorization: `${token}` }),
    },
  }).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, newUpdateStock: 0, message: FAIL }
  }
  const { data, total } = await dataFina.json()
  const ids = data.map((fina) => fina.ITEMNO)
  const dataItemQuo = await Item.find({ itemNo: { $in: ids } }).lean()

  const createNewItem = async (fina) => {
    const newData = await NewItem(fina)

    return new Item(newData).save()
  }
  const promiseCreate = [],
    promiseUpdate = []

  data.map((fina) => {
    const dataQuo = dataItemQuo.find(
      (data) => data.itemNo === String(fina.ITEMNO),
    )

    if (dataQuo) {
      if (dataQuo.stockSMI !== fina.STOCKSMI) {
        promiseUpdate.push(
          Item.findOneAndUpdate(
            { itemNo: String(fina.ITEMNO) },
            { stockSMI: fina.STOCKSMI },
          ),
        )
      }
    } else {
      promiseCreate.push(createNewItem(fina))
    }

    return true
  })

  await Promise.all(promiseCreate)
  await Promise.all(promiseUpdate)

  return {
    total,
    newData: promiseCreate.length,
    newUpdateStock: promiseUpdate.length,
    message: SUCCESS,
  }
  // let doPromises = []

  // data.map((fina) => doPromises.push(NewItem(fina)))
  // const dataItem = await Promise.all(doPromises)

  // doPromises = []

  // dataItem.map((fina) => {
  //   return doPromises.push(
  //     Item.findOneAndUpdate({ itemNo: fina.itemNo }, fina, {
  //       upsert: true,
  //       rawResult: true,
  //     }), //kelemahan cara ini ketika data tidak di isi maka tidak mengikuti default value schema
  //   )
  // })

  // const results = await Promise.all(doPromises)
  // const newData = results.reduce((prev, curr) => {
  //   const value = curr.lastErrorObject.updatedExisting ? 0 : 1

  //   return prev + value
  // }, 0)

  // return {
  //   total,
  //   newData,
  //   message: SUCCESS,
  // }
}

const SyncMasterUser = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(normalizeUrl(`${FINA_SMI_URI}/fina/sync-user`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  }).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }

  const { data, total } = await dataFina.json()
  const ids = data.map((fina) => fina.ID)
  const existData = await User.find({ userId: { $in: ids } }).lean()
  const filterDataFinaNotExistsInMongo = data.filter(
    (fina) => !existData.find((data) => data.userId === fina.ID),
  )

  filterDataFinaNotExistsInMongo.map(async (data) => {
    const newData = await NewUser(data)

    return new User(newData).save()
  })

  return {
    total,
    newData: filterDataFinaNotExistsInMongo.length,
    message: SUCCESS,
  }
}

const SyncMasterCustomer = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/sync-customer`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }
  const { data, total } = await dataFina.json()
  const ids = data.map((fina) => fina.ID)
  const existData = await Customer.find({ customerId: { $in: ids } }).lean()
  const filterDataFinaNotExistsInMongo = data.filter(
    (fina) => !existData.find((data) => data.customerId === fina.ID),
  )

  filterDataFinaNotExistsInMongo.map(async (data) => {
    const newData = await NewCustomer(data)

    return new Customer(newData).save()
  })

  return {
    total,
    newData: filterDataFinaNotExistsInMongo.length,
    message: SUCCESS,
  }
}

const SyncMasterSalesman = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/sync-salesman`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user.bypass ? { bypass: true } : { Authorization: `${token}` }),
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }
  const { data, total } = await dataFina.json()
  const newSalesman = (data) => {
    const newData = {
      salesmanId: data.ID,
      firstName: data.FIRSTNAME,
      lastName: data.LASTNAME,
    }

    return newData
  }
  const doPromises = []

  data.map((fina) => {
    return doPromises.push(
      Salesman.findOneAndUpdate({ salesmanId: fina.ID }, newSalesman(fina), {
        upsert: true,
        rawResult: true,
      }),
    )
  })

  const results = await Promise.all(doPromises)
  const newData = results.reduce((prev, curr) => {
    const value = curr.lastErrorObject.updatedExisting ? 0 : 1

    return prev + value
  }, 0)

  return {
    total,
    newData,
    message: SUCCESS,
  }
}

const SyncMasterTerm = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(normalizeUrl(`${FINA_SMI_URI}/fina/sync-term`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(user.bypass ? { bypass: true } : { Authorization: `${token}` }),
    },
  }).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    return { total: 0, newData: 0, message: FAIL }
  }
  const { data, total } = await dataFina.json()
  const newTerm = (data) => {
    const newData = {
      termId: data.ID,
      name: data.TERMNAME,
      note: data.TERMMEMO,
    }

    return newData
  }
  const doPromises = []

  data.map((fina) => {
    return doPromises.push(
      Term.findOneAndUpdate({ termId: fina.ID }, newTerm(fina), {
        upsert: true,
        rawResult: true,
      }),
    )
  })

  const results = await Promise.all(doPromises)
  const newData = results.reduce((prev, curr) => {
    const value = curr.lastErrorObject.updatedExisting ? 0 : 1

    return prev + value
  }, 0)

  return {
    total,
    newData,
    message: SUCCESS,
  }
}

const GetItems = async (query, user) => {
  const { skip, limit, category, itemNo, name, priceType } = await joi
    .object({
      category: joi.string().optional(),
      itemNo: joi.string().optional(),
      name: joi.string().optional(),
      priceType: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(20),
    })
    .validateAsync(query)

  const queryItem = {
    ...(category ? { category } : {}),
    ...(itemNo ? { itemNo: new RegExp(itemNo, 'gi') } : {}),
    ...(name ? { name: new RegExp(name, 'gi') } : {}),
    ...(priceType ? { priceType } : {}),
  }

  const items = await Item.find(queryItem)
    .sort({ _id: -1 })
    .skip(skip * limit)
    .limit(limit)
    .deepPopulate(['category'])
    .lean()

  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/so-outstanding`),
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
    return { items: [], differentData: 0, message: FAIL }
  }
  const { sumData, outstandingOrders } = await dataFina.json()
  const itemCount = await Item.countDocuments()
  let differentData = 0

  if (sumData !== itemCount) {
    differentData = Math.abs(sumData - itemCount)
  }

  items.map((item) => {
    item.stockSMI = item.stockSMI
    item.stockSupplier = item.stockSupplier
    item.totalStockReadySell = item.stockSMI + item.stockSupplier
    const outstandingData = outstandingOrders.find(
      (order) => String(order.ITEMNO) === item.itemNo,
    )

    item.outstandingOrder = outstandingData
      ? outstandingData.OUTSTANDINGORDER
      : 0

    return item
  })

  return { items, differentData, message: SUCCESS }
}

const GetLimitCustomer = async (user, body) => {
  const token = JwtSign(user)
  const { custID } = body
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/limit-customer/${custID}`),
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
    return { outstandingInv: 0, creditLimit: 0, restLimit: 0, message: FAIL }
  }
  const data = await dataFina.json()

  return {
    ...data,
    message: SUCCESS,
  }
}

module.exports = {
  SyncMasterItem,
  SyncMasterUser,
  SyncMasterItemCategory,
  SyncMasterCustomer,
  SyncMasterSalesman,
  SyncMasterTerm,
  GetItems,
  GetLimitCustomer,
}
