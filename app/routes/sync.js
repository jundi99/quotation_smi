const fina = require('../../app/controllers/fina')

module.exports = (express) =>
  new express.Router().post('/user', fina.SyncMasterUser)
