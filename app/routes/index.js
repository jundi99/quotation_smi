const fs = require('fs')
const path = require('path')

module.exports = (app, express) => {
  const router = new express.Router()

  fs.readdirSync(`${__dirname}/`).forEach((file) => {
    const extname = path.extname(file)
    const basename = path.basename(file, extname)

    if (file.indexOf('.js') >= 0 && basename !== 'index') {
      const loadFile = require(`./${basename}`)(express)

      router.use(`/${basename}`, loadFile)
    }
  })

  app.use(router)
}
