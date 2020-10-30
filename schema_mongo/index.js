const fs = require('fs')
const path = require('path')
const schemas = []

fs.readdirSync(`${__dirname}/`).forEach((file) => {
  const pathname = path.extname(file)
  const basename = path.basename(file, pathname)

  if (file.indexOf('.js') >= 0 && basename !== 'index') {
    const loadFile = require(`./${basename}`)

    schemas.push(loadFile)
  }
})

module.exports = schemas
