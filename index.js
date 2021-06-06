require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')
const useragent = require('express-useragent')
const compression = require('compression')
const { log } = console

const appRoutes = require('./app/routes')

const app = express()
const { ApolloServer } = require('apollo-server-express')
const jwt = require('express-jwt')
const { PORT, JWT_SECRET, REDIS_URI, REDIS_PORT } = process.env
const auth = jwt({
  secret: JWT_SECRET,
  credentialsRequired: false,
  algorithms: ['HS256'],
})
const kill = require('kill-port')
const asyncRedis = require('async-redis')
const redis = asyncRedis.createClient(REDIS_PORT, REDIS_URI)

app.use(logger('dev'))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(useragent.express())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
appRoutes(app, express)
app.use(auth)

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write(
    // '<form action="upload/item" method="post" enctype="multipart/form-data">',
    // '<form action="upload/price-contract" method="post" enctype="multipart/form-data">',
    '<form action="upload/attachment-po" method="post" enctype="multipart/form-data">',
  )
  res.write('<input type="file" name="filetoupload"><br>')
  res.write('<input name="quoNo" value="123456">')
  res.write('<input type="submit">')
  res.write('</form>')

  return res.end()
})

const schema = require('./graphql')
const server = new ApolloServer({
  schema,
  playground: {
    endpoint: '/graphql',
  },
  context: ({ req }) => {
    let user = null

    if (req.headers.user) {
      user = JSON.parse(req.headers.user)
    } else if (req.user) {
      const { user: reqUser } = req

      user = reqUser
    }

    return { user }
  },
  tracing: true,
  cacheControl: true,
  formatError: (error) => {
    try {
      const oriError = error.originalError
      const errorDetail = {
        code: oriError.statusCode,
        message: oriError.message,
        stack: oriError.stack,
      }

      return errorDetail
    } catch (e) {
      return error
    }
  },
})

server.applyMiddleware({ app })
app.use(helmet()) // if turn on this graphql will stuck on loading screen

kill(PORT, 'tcp')
  .then((result) => {
    log('Success kill port:', result)
    redis.del('syncItem')
    redis.del('syncCustomer')
    app.listen(PORT || 3000, () => {
      log(`The server started on port ${PORT}`)
    })
  })
  .catch((err) => log('error kill port:', err))

process.on('SIGINT', async () => {
  log('SIGINT signal received on ', new Date())

  // Stops the server from accepting new connections and
  // finishes existing connections.
  await server.stop()
  log('🚀  Server closed on ', new Date())
  process.exit(0)
})
