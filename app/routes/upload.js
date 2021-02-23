const uploadFina = require('../controllers/upload')
// const { ReqUserFromToken } = require('../utils')

module.exports = (express) =>
  new express.Router()
    // .use('*', ReqUserFromToken)
    .get('/', (req, res) => {
      res.send('respond with a resource')
    })
    .post('/item', uploadFina.XLSItem)
    .post('/price-contract', uploadFina.XLSPriceContract)
// .post('/attachment-po', uploadFina.AttachmentPO) not used again because FE use base64 to save pdf/image
