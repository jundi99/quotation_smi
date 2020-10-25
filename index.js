require('dotenv').config()
// const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')
const useragent = require('express-useragent')
const compression = require('compression')
const bodyParser = require('body-parser')

const appRoutes = require('./app/routes')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(compression())
app.use(useragent.express())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
appRoutes(app, express)

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
// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404))
// })

module.exports = app
