const { log, table } = console
const XLSItem = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, function (err, fields, files) {
      const oldpath = files.filetoupload.path
      const newpath = './public/file/' + files.filetoupload.name
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err
        const xlsxFile = require('read-excel-file/node')
        xlsxFile(`./public/file/${files.filetoupload.name}`).then((rows) => {
          log(rows)
          table(rows)
        })
        res.write('File uploaded and moved!')
        res.end()
      })
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  XLSItem,
}
