/* eslint-disable max-lines-per-function */
const { FINA_SMI_URI, REDIS_URI, REDIS_PORT } = process.env
const fetch = require('node-fetch')
const normalizeUrl = require('normalize-url')
const { JwtSign } = require('../utils')
const { NewItem, NewUser, NewCustomer } = require('../utils/helper')
const {
  SMIModels: { User, Item, ItemCategory, Salesman, Quotation, PriceContract },
  SMIModels2,
} = require('../daos')
const joi = require('joi')
const {
  StatusMessage: { SUCCESS, FAIL },
  FAIL_SYNC_SERVER,
} = require('../constants')
const {
  StatusQuo: { SENT, CLOSED },
} = require('../constants')
const { log, time, timeEnd, warn } = console
const _ = require('lodash')
const asyncRedis = require('async-redis')
const redis = asyncRedis.createClient(REDIS_PORT, REDIS_URI)
const { GetStockWarehouses } = require('./warehouseconfig')

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
    throw new Error(FAIL_SYNC_SERVER)
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

const syncItemPerSection = async (body) => {
  const { opt, token, limit, lastId, warehouseIds } = body
  const dataFina = await fetch(normalizeUrl(`${FINA_SMI_URI}/fina/sync-item`), {
    method: 'POST',
    body: JSON.stringify({
      opt,
      limit,
      lastId,
      warehouseIds,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  }).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    log('Fail syncItemPerSection:', dataFina)

    throw new Error(FAIL_SYNC_SERVER)
  }

  const data = await dataFina.json()

  return data
}

const countTotItemFina = async (token) => {
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/total-item`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    log('Fail countTotItemFina:', dataFina)

    throw new Error(FAIL_SYNC_SERVER)
  }

  const { total } = await dataFina.json()

  return total
}

const proceedItemFina = async (data) => {
  try {
    const ids = data.map((fina) => fina.ITEMNO)
    const dataItemQuo = await SMIModels2.Item.findWithDeleted({
      itemNo: { $in: ids },
    }).lean()
    const promiseUpdate = []
    const promiseCreate = []

    data.map((fina) => {
      const dataQuo = dataItemQuo.find(
        (data) => data.itemNo === String(fina.ITEMNO),
      )

      if (dataQuo) {
        promiseUpdate.push(NewItem(fina))
      } else {
        promiseCreate.push(NewItem(fina))
      }

      return true
    })

    if (promiseCreate.length) {
      const bulkData = await Promise.all(promiseCreate)

      await SMIModels2.Item.create(bulkData)
    } else if (promiseUpdate.length) {
      let bulkData = await Promise.all(promiseUpdate)

      bulkData = bulkData.map((data) => {
        return {
          updateOne: {
            filter: { itemNo: data.itemNo },
            update: data,
          },
        }
      })

      SMIModels2.Item.bulkWrite(bulkData)
    }

    return {
      totalCreated: promiseCreate.length,
      totalUpdated: promiseUpdate.length,
    }
  } catch (error) {
    log('error db:', error)

    throw error
  }
}

const proceedAsyncItemFina = async (opt, user, rKey) => {
  try {
    const token = JwtSign(user, '1h')
    const total = await countTotItemFina(token)
    const limit = 5000

    let getLastId = null
    let countTotalUpdated = 0
    let countTotalCreated = 0
    let progress = 0
    const percentage = 100 / Math.ceil(total / limit)
    const warehouseIds = await GetStockWarehouses()

    time()
    for (let index = 0; index < Math.ceil(total / limit); index++) {
      // eslint-disable-next-line no-await-in-loop
      const { data, lastId } = await syncItemPerSection({
        opt,
        token,
        limit,
        lastId: getLastId,
        warehouseIds,
      })
      // eslint-disable-next-line no-await-in-loop
      const { totalUpdated, totalCreated } = await proceedItemFina(data)

      countTotalUpdated += totalUpdated
      countTotalCreated += totalCreated

      getLastId = lastId
      progress += percentage
      log(
        `lastId: ${getLastId} | countTotalCreated:${countTotalCreated} | countTotalUpdated:${countTotalUpdated}`,
      )
      // eslint-disable-next-line no-await-in-loop
      await redis.set(
        rKey,
        JSON.stringify({
          status: 'processing',
          total,
          newData: countTotalCreated,
          updateData: countTotalUpdated,
          progress,
        }),
        'EX',
        200,
      )
    }

    timeEnd()
    log('DONE!')

    return await redis.set(
      rKey,
      JSON.stringify({
        status: 'completed',
        total,
        newData: countTotalCreated,
        updateData: countTotalUpdated,
        progress: 100,
      }),
      'EX',
      200,
    )
  } catch (error) {
    warn('error proceedAsyncItemFina:', error)

    return redis.set(
      rKey,
      JSON.stringify({
        status: 'failed',
      }),
      'EX',
      300,
    )
  }
}

const SyncMasterItem = async (opt, cache = true, user) => {
  try {
    const rKey = `syncItem`

    if (cache === false) {
      redis.del(rKey)
    }
    const val = await redis.get(rKey)
    const rVal = JSON.parse(val)
    const defaultTotal = {
      total: 0,
      newData: 0,
      updateData: 0,
      progress: 0,
    }

    if (rVal) {
      return rVal
    }

    if (cache || rVal === null) {
      proceedAsyncItemFina(opt, user, rKey)
      await redis.set(
        rKey,
        JSON.stringify({ status: 'processing', ...defaultTotal }),
        'EX',
        200,
      )
    }

    return {
      status: 'processing',
      ...defaultTotal,
    }
  } catch (error) {
    warn('error proceedAsyncItemFina:', error)

    return redis.set(
      rKey,
      JSON.stringify({
        status: 'failed',
      }),
      'EX',
      300,
    )
  }
}

// const SyncMasterUser = async (req, res) => {
const SyncMasterUser = async (user) => {
  const token = JwtSign(user)

  try {
    const dataFina = await fetch(
      normalizeUrl(`${FINA_SMI_URI}/fina/sync-user`),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
          bypass: true,
        },
      },
    ).catch((err) => {
      return { fail: true, err }
    })

    if (dataFina.fail || dataFina.ok === false) {
      throw new Error(FAIL_SYNC_SERVER)
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

    // res.json({
    //   total,
    //   newData: filterDataFinaNotExistsInMongo.length,
    //   message: SUCCESS,
    // })
    return {
      total,
      newData: filterDataFinaNotExistsInMongo.length,
      message: SUCCESS,
    }
  } catch (error) {
    // res.json({ err: true, message: 'Internal server error', errMessage: error })
    return { err: true, message: 'Internal server error', errMessage: error }
  }
}

const countTotCustomerFina = async (token) => {
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/total-customer`),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    log('Fail countTotCustomerFina:', dataFina)

    throw new Error(FAIL_SYNC_SERVER)
  }

  const { total } = await dataFina.json()

  return total
}

const syncCustomerPerSection = async (body) => {
  const { token, limit, lastId } = body
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/sync-customer`),
    {
      method: 'POST',
      body: JSON.stringify({
        limit,
        lastId,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    },
  ).catch((err) => {
    return { fail: true, err }
  })

  if (dataFina.fail || dataFina.ok === false) {
    log('Fail syncCustomerPerSection:', dataFina)

    throw new Error(FAIL_SYNC_SERVER)
  }

  const data = await dataFina.json()

  return data
}

const proceedCustomerFina = async (data) => {
  try {
    const ids = data.map((fina) => fina.ID)
    const existData = await SMIModels2.Customer.findWithDeleted({
      customerId: { $in: ids },
    }).lean()
    const promiseCreate = []
    const promiseUpdate = []
    const updateCustomer = (dataCust, fina) => {
      const newData = NewCustomer(fina)

      return _.merge(dataCust, newData)
    }

    const listSalesman = await Salesman.find(
      {},
      { _id: 1, salesmanId: 1 },
    ).lean()

    data.map((fina) => {
      const dataCust = existData.find((data) => data.customerId === fina.ID)
      const salesman = listSalesman.find(
        (salesman) => salesman.salesmanId === fina.SALESMANID,
      )

      fina.salesmanId = salesman ? salesman._id : null
      if (dataCust) {
        promiseUpdate.push(updateCustomer(dataCust, fina))
      } else {
        promiseCreate.push(NewCustomer(fina))
      }

      return true
    })
    if (promiseCreate.length) {
      const bulkData = await Promise.all(promiseCreate)

      await SMIModels2.Customer.create(bulkData)
    } else if (promiseUpdate.length) {
      let bulkData = await Promise.all(promiseUpdate)

      bulkData = bulkData.map((data) => {
        return {
          updateOne: {
            filter: { _id: data._id },
            update: data,
          },
        }
      })

      SMIModels2.Customer.bulkWrite(bulkData)
    }

    return {
      totalCreated: promiseCreate.length,
      totalUpdated: promiseUpdate.length,
    }
  } catch (error) {
    log('error db:', error)

    throw error
  }
}

const processAsyncCustomer = async (user, rKey) => {
  try {
    const token = JwtSign(user, '1h')

    const total = await countTotCustomerFina(token)
    const limit = 50

    let getLastId = null
    let countTotalUpdated = 0
    let countTotalCreated = 0
    let progress = 0
    const percentage = 100 / Math.ceil(total / limit)

    time()
    for (let index = 0; index < Math.ceil(total / limit); index++) {
      // eslint-disable-next-line no-await-in-loop
      const { data, lastId } = await syncCustomerPerSection({
        token,
        limit,
        lastId: getLastId,
      })
      // eslint-disable-next-line no-await-in-loop
      const { totalUpdated, totalCreated } = await proceedCustomerFina(data)

      countTotalUpdated += totalUpdated
      countTotalCreated += totalCreated

      getLastId = lastId
      progress += percentage
      log(
        `lastId: ${getLastId} | countTotalCreated:${countTotalCreated} | countTotalUpdated:${countTotalUpdated}`,
      )
      // eslint-disable-next-line no-await-in-loop
      await redis.set(
        rKey,
        JSON.stringify({
          status: 'processing',
          total,
          newData: countTotalCreated,
          updateData: countTotalUpdated,
          progress,
        }),
        'EX',
        200,
      )
    }

    timeEnd()
    log('DONE!')

    return await redis.set(
      rKey,
      JSON.stringify({
        status: 'completed',
        total,
        newData: countTotalCreated,
        updateData: countTotalUpdated,
        progress: 100,
      }),
      'EX',
      200,
    )
  } catch (error) {
    warn('error processAsyncCustomer:', error)

    return redis.set(
      rKey,
      JSON.stringify({
        status: 'failed',
      }),
      'EX',
      300,
    )
  }
}

const SyncMasterCustomer = async (user, cache = true) => {
  try {
    const rKey = `syncCustomer`

    if (cache === false) {
      redis.del(rKey)
    }
    const val = await redis.get(rKey)
    const rVal = JSON.parse(val)
    const defaultTotal = {
      total: 0,
      newData: 0,
      updateData: 0,
      progress: 0,
    }

    if (rVal) {
      return rVal
    }

    if (cache || rVal === null) {
      processAsyncCustomer(user, rKey)
      await redis.set(
        rKey,
        JSON.stringify({ status: 'processing', ...defaultTotal }),
        'EX',
        200,
      )
    }

    return {
      ...defaultTotal,
      status: 'processing',
    }
  } catch (error) {
    warn('error processAsyncCustomer:', error)

    return redis.set(
      rKey,
      JSON.stringify({
        status: 'failed',
      }),
      'EX',
      300,
    )
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
    throw new Error(FAIL_SYNC_SERVER)
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

const GetItems = async (query, user) => {
  const { skip, limit, category, itemNo, name, priceType } = await joi
    .object({
      category: joi.string().optional(),
      itemNo: joi.string().optional(),
      name: joi.string().optional(),
      priceType: joi.string().optional(),
      skip: joi.number().min(0).default(0),
      limit: joi.number().min(1).default(25),
    })
    .validateAsync(query)

  const queryItem = {
    ...(category ? { category } : {}),
    ...(itemNo ? { itemNo: new RegExp(itemNo, 'gi') } : {}),
    ...(name ? { name: new RegExp(name, 'gi') } : {}),
  }
  const listItem = await Item.find(queryItem)
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

  let sumData = 0
  let outstandingOrders = []

  if (dataFina.ok) {
    const resultFina = await dataFina.json()

    sumData = resultFina.sumData
    outstandingOrders = resultFina.outstandingOrders
  }

  const itemCount = await Item.countDocuments()
  let differentData = 0

  if (sumData !== itemCount) {
    differentData = Math.abs(sumData - itemCount)
  }
  const itemNos = listItem.map((item) => item.itemNo)
  const listPack = await PriceContract.aggregate([
    {
      $match: {
        deleted: false,
        ...(priceType ? { priceType } : {}),
      },
    },
    { $project: { details: 1 } },
    { $unwind: '$details' },
    {
      $group: {
        _id: '$details.itemNo',
        qtyPack: { $first: '$details.qtyPack' },
      },
    },
    { $match: { _id: { $in: itemNos } } },
    { $sort: { _id: 1 } },
  ])

  listItem.map((item) => {
    const pack = listPack.find((value) => value._id === item.itemNo)

    item.qtyPack = pack ? pack.qtyPack : 'NA'
    item.stockSMI = item.stockSMI ? item.stockSMI : 0
    item.stockSupplier = item.stockSupplier ? item.stockSupplier : 0
    item.totalStockReadySell = item.stockSMI + item.stockSupplier
    const outstandingData = outstandingOrders.find(
      (order) => String(order.ITEMNO) === item.itemNo,
    )

    item.outstandingOrder = outstandingData
      ? outstandingData.OUTSTANDINGORDER
      : 0

    return item
  })

  return { items: listItem, differentData, message: SUCCESS, total: itemCount }
}

const GetLimitCustomer = async (user, body) => {
  const token = JwtSign(user)
  const { personNo } = body
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/limit-customer/${personNo}`),
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

const CheckQuoProceed = async () => {
  const quotations = await Quotation.find(
    { status: 'Processed' },
    { quoNo: 1 },
  ).lean()
  const quoNos = quotations.map((quo) => quo.quoNo)

  if (!quoNos.length) {
    return { message: SUCCESS }
  }
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/quo-proceed`),
    {
      method: 'POST',
      body: JSON.stringify({
        quoNos,
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
    return { message: FAIL }
  }
  const { results } = await dataFina.json()

  return Promise.all(
    results.map((result) =>
      Quotation.updateOne(
        { quoNo: result.CHEQUENO },
        {
          status: result.STATUS === 0 ? SENT : CLOSED,
          deliveryStatus: result.DESCRIPTION,
        },
      ),
    ),
  )
}

const GetListWarehouse = async (user) => {
  const token = JwtSign(user)
  const dataFina = await fetch(
    normalizeUrl(`${FINA_SMI_URI}/fina/list-warehouse`),
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
    return { warehouses: [], message: FAIL }
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
  GetItems,
  GetLimitCustomer,
  CheckQuoProceed,
  GetListWarehouse,
}
