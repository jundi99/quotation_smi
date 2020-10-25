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

module.exports = {
  CreateSO,
  SyncMasterItem,
}
