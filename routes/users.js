var express = require('express');
var router = express.Router();
const users = require('../bin/users')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
}).get('/firebird', users.ConnectFB);

module.exports = router;
