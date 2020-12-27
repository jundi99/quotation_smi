// const fina = require('../controllers/fina')
// const { ReqUserFromToken } = require('../utils')

module.exports = (express) =>
  new express.Router()
    // .use('*', ReqUserFromToken)
    .get('/', (req, res) => {
      res.send('respond with a resource')
    })
