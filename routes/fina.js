var express = require("express");
var router = express.Router();
const fina = require("../bin/fina");

/* GET users listing. */
router
  .get("/", function (req, res, next) {
    res.send("respond with a resource");
  })
  .get("/create-so", fina.CreateSO);

module.exports = router;
