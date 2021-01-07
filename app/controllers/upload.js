const { log, table } = console
const {
  SMIModels: { Item },
} = require('../daos')

const XLSItem = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, (err, fields, files) => {
      if (err) {
        throw err
      }
      const oldpath = files.filetoupload.path
      const newpath = `./public/file/${files.filetoupload.name}`

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          throw err
        }
        const xlsxFile = require('read-excel-file/node')

        xlsxFile(`./public/file/${files.filetoupload.name}`).then((rows) => {
          rows.shift()
          const doSyncUpload = async (data) => {
            const { itemNo, stockSupplier } = data

            const isItemExist = await Item.findOne({ itemNo }).lean()

            if (isItemExist) {
              return Item.updateOne({ itemNo }, { stockSupplier })
            }

            return new Item(data).save()
          }

          rows.map((row) => {
            const data = {
              itemNo: row[0],
              name: row[1],
              unit: row[2],
              stockSupplier: row[3],
            }

            doSyncUpload(data)

            return true
          })
          log(rows)
          table(rows)
        })

        res.write('File uploaded and moved!')

        return res.end()
      })
    })

    return true
  } catch (error) {
    return next(error)
  }
}

const XLSPriceContract = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, (err, fields, files) => {
      if (err) {
        throw err
      }
      const oldpath = files.filetoupload.path
      const newpath = `./public/file/${files.filetoupload.name}`

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          throw err
        }
        const xlsxFile = require('read-excel-file/node')

        xlsxFile(`./public/file/${files.filetoupload.name}`).then(
          async (rows) => {
            rows.shift()
            const listExists = []
            const notExists = []

            for (let index = 0; index < rows.length; index++) {
              const row = rows[index]
              const itemNo = row[0]
              const isItemExist = await Item.findOne({ itemNo }).lean()

              if (isItemExist) {
                const data = {
                  itemNo: row[0],
                  qtyPack: row[1],
                  sellingPrice: row[2],
                  moreQty: row[3],
                  lessQty: row[4],
                  equalQty: row[5],
                }

                listExists.push(data)
              } else {
                notExists.push(itemNo)
              }
            }

            log(rows)
            table(rows)

            return res.json({ data: listExists, notExists })
          },
        )
      })
    })

    return true
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  XLSItem,
  XLSPriceContract,
}
