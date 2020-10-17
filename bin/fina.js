const CreateSO = async (req, res, next) => {
  var Firebird = require("node-firebird");
  var options = {};

  // options.host = '127.0.0.1';
  options.host = "192.168.1.7";
  options.port = 3051;
  options.database = "G:/Sample.fdb";
  options.user = "v1c09";
  options.password = "integrity01";
  options.lowercase_keys = false; // set to true to lowercase keys
  options.role = null; // default
  options.pageSize = 4096; // default when creating database

  Firebird.attach(options, function (err, db) {
    if (err) throw err;

    // db = DATABASE
    db.query("select SOID from GETSOID", [], (err, result) => {
      const [data] = result;
      const { SOID } = data;
      db.query(
        "INSERT INTO SO (SOID, SONO, ESTSHIPDATE, INVAMOUNT) VALUES(?, ?, ?, ?) returning SOID",
        [SOID, "A7", new Date(), 10000],
        function (err, { SOID }) {
          console.log(err);
          console.log(SOID);
          db.query("SELECT * FROM SO WHERE SOID=?", [SOID], function (
            err,
            result
          ) {
            console.log(result);
            db.detach();
          });
        }
      );
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
    });
    res.json("ok");
  });
};

module.exports = {
  CreateSO,
};
