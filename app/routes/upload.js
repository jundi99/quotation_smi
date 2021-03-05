const uploadFina = require('../controllers/upload')
// const { ReqUserFromToken } = require('../utils')
const cors = require('cors')
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: 'http://172.104.181.69',
    optionsSuccessStatus: 200,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }

  callback(null, corsOptions) // callback expects two parameters: error and options
}

module.exports = (express) =>
  new express.Router()
    .options('/price-contract', cors(corsOptionsDelegate))
    .options('/item', cors(corsOptionsDelegate))
    .post('/item', cors(corsOptionsDelegate), uploadFina.XLSItem)
    .post(
      '/price-contract',
      cors(corsOptionsDelegate),
      uploadFina.XLSPriceContract,
    )
// .post('/attachment-po', uploadFina.AttachmentPO) not used again because FE use base64 to save pdf/image
