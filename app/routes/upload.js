const uploadFina = require('../controllers/upload')
// const { ReqUserFromToken } = require('../utils')

module.exports = (express) =>
  new express.Router()
    // .use('*', ReqUserFromToken)
    .get('/', (req, res) => {
      res.send('respond with a resource')
    })
    .post('/item', uploadFina.XLSItem)
