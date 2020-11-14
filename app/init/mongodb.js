const mongoose = require('mongoose')
const { error, log } = console
const { SMI_MONGO_URI, NODE_ENV, TEST_MONGO_URI, ENABLE_DB_LOG } = process.env

if (NODE_ENV === 'test') {
  if (!TEST_MONGO_URI) {
    error('TEST_MONGO_URI required for test.')
  }
} else if (!SMI_MONGO_URI) {
  error('SMI_MONGO_URI env is required.')
}

mongoose.set('debug', ENABLE_DB_LOG === 'true')
mongoose.Promise = Promise

/**
 * Connect
 * @param {*} object { url, name, config }
 * @return {*} connections
 */
const connect = ({ url, name, config }) => {
  const newConnection = mongoose.createConnection(url, config)

  newConnection.on('error', () => {
    error('mongodb connection failed.')
  })

  log(`MongoDB Connection Established (${name}).`)

  return newConnection
}

const SMIDBConn = connect({
  url: NODE_ENV === 'test' ? TEST_MONGO_URI : SMI_MONGO_URI,
  name: 'SMI_MONGO_URI',
  config: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: 1,
    autoIndex: false,
    useFindAndModify: false,
  },
})

process.on('SIGINT', () => {
  log('\nDisconnecting mongo connection...')
  SMIDBConn.close().then(() => {
    log('SMI mongodb connection terminated')
  })
})

module.exports = {
  SMIDBConn,
}
