require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')
const useragent = require('express-useragent')
const compression = require('compression')
const bodyParser = require('body-parser')
const { log } = console

const appRoutes = require('./app/routes')

const app = express()
const { ApolloServer } = require('apollo-server-express')
const jwt = require('express-jwt')
const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolver')
const { PORT, JWT_SECRET } = process.env
const auth = jwt({
  secret: JWT_SECRET,
  credentialsRequired: false,
  algorithms: ['HS256'],
})

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
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
    '<form action="upload/item" method="post" enctype="multipart/form-data">'
  )
  res.write('<input type="file" name="filetoupload"><br>')
  res.write('<input type="submit">')
  res.write('</form>')
  return res.end()
})


const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: '/graphql',
  },
  context: ({ req }) => {
    const user = req.headers.user
      ? JSON.parse(req.headers.user)
      : req.user
      ? req.user
      : null
    return { user }
  },
  // context: ({ req, connection, res }) => {
  //   if (connection) {
  //     return connection.context
  //   }

  //   return {
  //     req,
  //     headers: req.headers,
  //     res,
  //   }
  // },
  tracing: true,
  cacheControl: true,
  formatError: (error) => {
    try {
      // const err = JSON.parse(error.message)

      // const errorDetail = {
      //   ...err,
      //   locations: error.locations,
      //   stack: error.stack,
      //   path: error.path,
      // }

      // if (error && error.code) {
      //   errorDetail.code = error.code
      // }

      // if (error && error.errCode) {
      //   errorDetail.errCode = error.errCode
      // }

      // if (error && error.service) {
      //   errorDetail.service = error.service
      // }

      // return errorDetail
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
app.use(helmet()) //if turn on this graphql will stuck on loading screen
app.listen(PORT || 3000, () => {
  console.log('The server started on port ' + PORT)
})

process.on('SIGINT', async () => {
  log('SIGINT signal received on ', new Date())

  // Stops the server from accepting new connections and finishes existing connections.
  await server.stop()
  log('🚀  Server closed on ', new Date())
  process.exit()
})

