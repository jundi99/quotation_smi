const { DB_FINA, DB_FINA_PORT, DB_FINA_HOST } = process.env
const Firebird = require('node-firebird')
const options = {}

options.host = DB_FINA_HOST
options.port = DB_FINA_PORT
options.database = DB_FINA
options.user = 'v1c09'
options.password = 'integrity01'
options.lowercase_keys = false // set to true to lowercase keys
options.role = null // default
options.pageSize = 4096 // default when creating database
options.charset = 'utf8'
const {
  SMIModels: { User, Item, ItemCategory, CustomerType },
} = require('../daos')
const { log } = console
const q = require('q') // promises lib
let db
const connectToDB = (acfg) => {
  const def = q.defer()

  Firebird.attach(acfg, (err, db) => {
    err ? def.reject(err) : def.resolve(db)
  })

  return def.promise
}

const disconnectFromDB = () => {
  db.detach(() => {
    log('database detached')
  })
}

const QueryToDB = (sql, param = []) => {
  const def = q.defer()

  connectToDB(options).then(
    // success
    (dbconn) => {
      db = dbconn
      db.query(sql, param, (err, rs) => {
        err ? def.reject(err) : def.resolve(rs)
      })
    },
    // fail
    (err) => {
      log(err)
    },
  )

  return def.promise
}

const CreateSO = (req, res) => {
  Firebird.attach(options, (err, db) => {
    if (err) {
      throw err
    }

    db.query('select SOID from GETSOID', [], (err, result) => {
      if (err) {
        throw err
      }
      const [data] = result
      const { SOID } = data

      db.query(
        `INSERT INTO SO (SOID, SONO, ESTSHIPDATE, INVAMOUNT) 
        VALUES(?, ?, ?, ?) returning SOID`,
        [SOID, 'A7', new Date(), 10000],
        (err, { SOID }) => {
          if (err) {
            throw err
          }
          db.query('SELECT * FROM SO WHERE SOID=?', [SOID], (err, result) => {
            if (err) {
              throw err
            }
            log(result)
            db.detach()
          })
        },
      )
      // db.transaction(Firebird.ISOLATION_READ_COMMITED, function(err, transaction) {
      //     transaction.query(
      //         'INSERT INTO SO (SOID, SONO, ESTSHIPDATE, INVAMOUNT) VALUES(?, ?, ?, ?)',
      //         [SOID.SOID, 'A1', '12.10.2020', 10000], function(err, result) {

      //         if (err) {
      //             transaction.rollback();
      //             return;
      //         }

      //         transaction.commit(function(err) {
      //             if (err)
      //                 transaction.rollback();
      //             else
      //                 db.detach();
      //         });
      //     });
      // });
    })
    res.json('ok')
  })
}

const DoProccessData = async ({
  limit,
  sumData,
  Collection,
  filterDataCreated,
  newDataObj,
}) => {
  let countNewData = 0

  const promises = []
  const dataNeedCreated = async (skip) => {
    const data = await filterDataCreated(skip)

    countNewData += data.length

    return data.map(async (data) => {
      const newData = await newDataObj(data)

      return new Collection(newData).save()
    })
  }

  for (let index = 0; index < Math.ceil(sumData / limit); index++) {
    const skip = limit * (index + 1) - limit

    promises.push(dataNeedCreated(skip))
  }

  await Promise.all(promises)
  disconnectFromDB()

  return { total: sumData, newData: countNewData, message: 'Success' }
}

const SyncMasterItemCategory = async () => {
  let query = `SELECT count(*) FROM ITEMCATEGORY`
  const [{ COUNT: sumData }] = await QueryToDB(query)

  query = `SELECT ic.CATEGORYID as ID, ic.NAME
  FROM ITEMCATEGORY ic`

  const findById = (ids) => {
    const findId = { categoryId: { $in: ids } }

    return findId
  }
  const compareId = (data, fina) => data.categoryId === fina.ID
  const newItem = (data) => {
    const newData = {
      categoryId: data.ID,
      name: data.NAME,
    }

    return newData
  }

  const dataFina = await QueryToDB(query)
  const ids = dataFina.map((data) => data.ID)
  const existData = await ItemCategory.find(findById(ids)).lean()
  const dataNeedCreated = dataFina.filter(
    (fina) => !existData.find((data) => compareId(data, fina)),
  )

  const doPromises = []

  dataNeedCreated.map((data) => {
    const newData = newItem(data)
    const dataSaved = new ItemCategory(newData).save()

    doPromises.push(dataSaved)

    return true
  })
  await Promise.all(doPromises)

  disconnectFromDB()

  return {
    total: sumData,
    newData: dataNeedCreated.length,
    message: 'Success',
  }
}

const newItem = async (data) => {
  let category = {}

  if (data.CATEGORYID) {
    category = await ItemCategory.findOne(
      { categoryId: data.CATEGORYID },
      { _id: 1 },
    ).lean()
  }

  const newData = {
    itemNo: data.ID,
    name: data.ITEMDESCRIPTION,
    unit: data.UNIT1,
    reserved: {
      item1: data.RESERVED1,
      item2: data.RESERVED2,
      item3: data.RESERVED3,
      item4: data.RESERVED4,
      item5: data.RESERVED5,
      item6: data.RESERVED6,
      item7: data.RESERVED7,
      item8: data.RESERVED8,
      item9: data.RESERVED9,
      item10: data.RESERVED10,
    },
    price: {
      level1: data.UNITPRICE,
      level2: data.UNITPRICE2,
      level3: data.UNITPRICE3,
      level4: data.UNITPRICE4,
      level5: data.UNITPRICE5,
    },
    quantity: data.QUANTITY,
    note: data.NOTES,
    weigth: data.WEIGTH,
    dimension: {
      width: data.DIMWIDTH,
      heigth: data.DIMHEIGHT,
      depth: data.DIMDEPTH,
    },
    category: category._id,

    stockSMI: 0,
  }

  return newData
}

const SyncMasterItem = async () => {
  const limit = 2 // default will set 200
  let query = `SELECT count(*) FROM ITEM i WHERE i.SUSPENDED=0`
  const [{ COUNT: sumData }] = await QueryToDB(query)

  query = `SELECT FIRST ? SKIP ? i.ITEMNO as ID, 
  i.ITEMDESCRIPTION, i.UNIT1,
  i.RESERVED1, i.RESERVED2, i.RESERVED3, i.RESERVED4,
  i.RESERVED5, i.RESERVED6, i.RESERVED7, i.RESERVED8,
  i.RESERVED9, i.RESERVED10, i.UNITPRICE, i.UNITPRICE2, 
  i.UNITPRICE3, i.UNITPRICE4, i.UNITPRICE5,
  i.QUANTITY, i.CATEGORYID, i.NOTES, i.DIMDEPTH, 
  i.DIMHEIGHT, i.DIMWIDTH, i.WEIGHT
  FROM ITEM i WHERE i.SUSPENDED=0 ORDER BY ITEMNO`

  const filterDataCreated = async (skip) => {
    const dataFina = await QueryToDB(query, [limit, skip])
    const ids = dataFina.map((data) => data.ID)
    const existData = await Item.find({ itemNo: { $in: ids } }).lean()

    return dataFina.filter(
      (fina) => !existData.find((data) => data.itemNo === String(fina.ID)),
    )
  }

  return DoProccessData({
    limit,
    sumData,
    Collection: Item,
    filterDataCreated,
    newDataObj: newItem,
  })
}

const CRUD = {
  create: true,
  edit: true,
  delete: true,
  print: true,
}
const newUser = (user) => {
  let authorizeUser = {}

  if (user.USERLEVEL === 0) {
    authorizeUser = {
      item: CRUD,
      itemCategory: CRUD,
      customer: CRUD,
      custCategory: CRUD,
      price: CRUD,
      sales: CRUD,
      user: CRUD,
      itemStock: CRUD,
      quotation: CRUD,
      priceApproval: CRUD,
      salesOrder: CRUD,
      importExcel: CRUD,
    }
  } else if (user.USERLEVEL === 2) {
    authorizeUser.quotation = CRUD
    authorizeUser.salesOrder = CRUD
  }
  const newData = {
    userName: user.USERNAME,
    encryptedPassword: user.USERNAME,
    userId: user.ID,
    profile: {
      fullName: user.FULLNAME,
      userLevel: user.USERLEVEL,
    },
    authorize: authorizeUser,
  }

  return newData
}

const SyncMasterUser = async () => {
  const limit = 2 // default will set 200
  let query = `SELECT count(*) FROM USERS r`
  const [{ COUNT: sumData }] = await QueryToDB(query)

  query = `SELECT FIRST ? SKIP ? r.userId as ID, 
  r.userName, r.userLevel, r.fullName FROM USERS r
  ORDER BY USERID`

  const filterDataCreated = async (skip) => {
    const dataFina = await QueryToDB(query, [limit, skip])
    const ids = dataFina.map((data) => data.ID)
    const existData = await User.find({ userId: { $in: ids } }).lean()
    const filtered = dataFina.filter(
      (fina) => !existData.find((data) => data.userId === fina.ID),
    )

    return filtered
  }

  return DoProccessData({
    limit,
    sumData,
    Collection: User,
    filterDataCreated,
    newDataObj: newUser,
  })
}

const SyncMasterCustomer = async () => {
  const limit = 2 // default will set 200
  let query = `SELECT count(*) FROM USERS r`
  const [{ COUNT: sumData }] = await QueryToDB(query)

  query = `SELECT FIRST ? SKIP ? r.userId as ID, 
  r.userName, r.userLevel, r.fullName FROM USERS r
  ORDER BY USERID`

  const filterDataCreated = async (skip) => {
    const dataFina = await QueryToDB(query, [limit, skip])
    const ids = dataFina.map((data) => data.ID)
    const existData = await User.find({ userId: { $in: ids } }).lean()
    const filtered = dataFina.filter(
      (fina) => !existData.find((data) => data.userId === fina.ID),
    )

    return filtered
  }

  return DoProccessData({
    limit,
    sumData,
    Collection: User,
    filterDataCreated,
    newDataObj: newUser,
  })
}

const SyncMasterCustType = async () => {
  let query = `SELECT count(*) FROM CUSTTYPE`
  const [{ COUNT: sumData }] = await QueryToDB(query)

  query = `SELECT ct.CUSTOMERTYPEID as ID, ct.TYPENAME
  FROM CUSTTYPE ct`

  const findById = (ids) => {
    const findId = { typeId: { $in: ids } }

    return findId
  }
  const compareId = (data, fina) => data.typeId === fina.ID
  const newCustType = (data) => {
    const newData = {
      typeId: data.ID,
      name: data.TYPENAME,
    }

    return newData
  }

  const dataFina = await QueryToDB(query)
  const ids = dataFina.map((data) => data.ID)
  const existData = await CustomerType.find(findById(ids)).lean()
  const dataNeedCreated = dataFina.filter(
    (fina) => !existData.find((data) => compareId(data, fina)),
  )

  const doPromises = []

  dataNeedCreated.map((data) => {
    const newData = newCustType(data)
    const dataSaved = new CustomerType(newData).save()

    doPromises.push(dataSaved)

    return true
  })
  await Promise.all(doPromises)

  disconnectFromDB()

  return {
    total: sumData,
    newData: dataNeedCreated.length,
    message: 'Success',
  }
}

module.exports = {
  CreateSO,
  SyncMasterItem,
  SyncMasterUser,
  SyncMasterItemCategory,
  SyncMasterCustomer,
  SyncMasterCustType,
}
