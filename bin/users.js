const ConnectFB = async(req, res, next) => {
    var Firebird = require('node-firebird');
    var options = {};
 
    // options.host = '127.0.0.1';
    options.host = '192.168.1.7';
    options.port = 3051;
    options.database = 'G:/Sample.fdb';
    options.user = 'v1c09';
    options.password = 'integrity01';
    options.lowercase_keys = false; // set to true to lowercase keys
    options.role = null;            // default
    options.pageSize = 4096;        // default when creating database

    var pool = Firebird.pool(5, options);
 
    // Get a free pool
    pool.get(function(err, db) {
     
        if (err)
            throw err;
     
        // db = DATABASE
        db.query('SELECT * FROM APINV', function(err, result) {
            // IMPORTANT: release the pool connection
            db.detach();
        });
    });
     
    // Destroy pool
    pool.destroy();
}

module.exports = {
    ConnectFB
}