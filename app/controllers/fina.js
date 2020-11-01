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
  SMIModels: { User },
} = require('../daos')
const q = require('q') // promises lib
let db
const connectToDB = (acfg) => {
  var def = q.defer()

  Firebird.attach(acfg, function (err, db) {
    err ? def.reject(err) : def.resolve(db)
  })
  return def.promise
}

const disconnectFromDB = () => {
  db.detach(function () {
    console.log('database detached')
  })
}

const QueryToDB = async (sql, param = []) => {
  var def = q.defer()

  connectToDB(options).then(
    // success
    function (dbconn) {
      db = dbconn
      db.query(sql, param, function (err, rs) {
        err ? def.reject(err) : def.resolve(rs)
      })
    },
    // fail
    function (err) {
      console.log(err)
    }
  )
  return def.promise
}

const CreateSO = (req, res, next) => {
  Firebird.attach(options, (err, db) => {
    if (err) throw err

    db.query('select SOID from GETSOID', [], (err, result) => {
      const [data] = result
      const { SOID } = data

      db.query(
        'INSERT INTO SO (SOID, SONO, ESTSHIPDATE, INVAMOUNT) VALUES(?, ?, ?, ?) returning SOID',
        [SOID, 'A7', new Date(), 10000],
        (err, { SOID }) => {
          console.log(err)
          console.log(SOID)
          db.query('SELECT * FROM SO WHERE SOID=?', [SOID], (err, result) => {
            console.log(result)
            db.detach()
          })
        }
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

const SyncMasterItem = (req, res, next) => {
  try {
    Firebird.attach(options, (err, db) => {
      if (err) throw err

      db.query(
        `SELECT i.ITEMNO, i.ITEMDESCRIPTION, i.UNIT1,
      i.RESERVED1, i.RESERVED2, i.RESERVED3, i.RESERVED4,
      i.RESERVED5, i.RESERVED6, i.RESERVED7, i.RESERVED8,
      i.RESERVED9, i.RESERVED10, i.MINIMUMQTY, i.QUANTITY,
      i.UNITPRICE, i.CATEGORYID, i.NOTES
      FROM ITEM i`,
        [],
        (err, result) => {
          const [data] = result
          const { SOID } = data

          //masukkan dengan replace ke db mongo
        }
      )
    })
  } catch (error) {
    next(error)
  }
}

const SyncUser = async () => {
  try {
    const limit = 2 //default will set 200
    let queryUser = `SELECT count(*) FROM USERS r`
    const [{ COUNT }] = await QueryToDB(queryUser)
    queryUser = `SELECT FIRST ? SKIP ? r.userId, r.userName, r.userLevel, r.fullName FROM USERS r`
    let countNewUser = 0
    for (let index = 0; index < Math.ceil(COUNT / limit); index++) {
      const userFina = await QueryToDB(queryUser, [limit, index])
      const ids = userFina.map((user) => user.USERID)
      const existUser = await User.find({ userId: { $in: ids } }).lean()
      const userNeedCreated = userFina.filter(
        (fina) => !existUser.find((user) => user.userId === fina.USERID)
      )
      const CRUD = {
        create: true,
        edit: true,
        delete: true,
        print: true,
      }
      const doPromises = []
      userNeedCreated.map(async (user) => {
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
          userId: user.USERID,
          profile: {
            fullName: user.FULLNAME,
            userLevel: user.USERLEVEL,
          },
          authorize: authorizeUser,
        }
        const newUser = new User(newData).save()
        doPromises.push(newUser)
        countNewUser += 1
      })
      await Promise.all(doPromises)
    }

    disconnectFromDB()
    return { total: COUNT, newUser: countNewUser, message: 'Success' }
  } catch (error) {
    throw error
  }
}
module.exports = {
  CreateSO,
  SyncMasterItem,
  SyncUser,
}
