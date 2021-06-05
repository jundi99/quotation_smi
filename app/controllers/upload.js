/* eslint-disable max-lines-per-function */
const { log, table } = console
const {
  SMIModels: { Item },
} = require('../daos')
const { URL, PORT } = process.env
const normalizeURL = require('normalize-url')
const StandardError = require('../../utils/standard_error')

const XLSItem = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err) // cannot catch to try catch so handle next on this
      }
      if (files.filetoupload.name === '') {
        return next(new StandardError('Please choose xls file first'))
      }
      const oldpath = files.filetoupload.path
      const newpath = `./public/file/${files.filetoupload.name}`

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          return next(err)
        }
        const xlsxFile = require('read-excel-file/node')

        xlsxFile(newpath)
          .then((rows) => {
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
          .catch((err) => {
            log('error XLS Item:', err)

            return res.json({ message: 'Fail', error: err })
          })

        res.write('File uploaded and moved!')

        return res.end()
      })

      return true
    })

    return true
  } catch (error) {
    return next(error)
  }
}

const getFormatFileName = (field, fileName) => {
  const todayTime = new Date()
  const month = todayTime.getMonth() + 1
  const day = todayTime.getDate()
  const year = todayTime.getFullYear()
  const getExt = fileName.split('.')

  return `${month}-${day}-${year}_${field}.${getExt[getExt.length - 1]}`
}

const XLSPriceContract = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err)
      }
      if (files.filetoupload.name === '') {
        return next(new StandardError('Please choose file/image first'))
      }

      const oldpath = files.filetoupload.path
      const nameFile = getFormatFileName(
        fields.priceNo,
        files.filetoupload.name,
      )

      const newpath = `./public/file/${fields ? nameFile : files.filetoupload.name
        }`

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          return next(err)
        }
        const xlsxFile = require('read-excel-file/node')

        xlsxFile(newpath)
          .then(async (rows) => {
            rows.shift()
            const listExists = []
            const notExists = []
            const doPromises = []
            const setDataItems = async (itemNo, row) => {
              const isItemExist = await Item.findOne({ itemNo }).lean()

              if (isItemExist) {
                const data = {
                  itemNo,
                  itemName: isItemExist.name,
                  unit: isItemExist.unit,
                  qtyPack: row[1],
                  sellPrice: row[2],
                  moreQty: row[3],
                  lessQty: row[4],
                  equalQty: row[5],
                }

                listExists.push(data)
              } else {
                notExists.push(itemNo)
              }
            }

            for (let index = 0; index < rows.length; index++) {
              const row = rows[index]
              const itemNo = String(row[0])

              doPromises.push(setDataItems(itemNo, row))
            }

            await Promise.all(doPromises)
            log(rows)
            table(rows)
            listExists.sort((a, b) => {
              if (a.itemNo > b.itemNo) {
                return -1
              }
              if (b.itemNo > a.itemNo) {
                return 1
              }

              return 0
            })

            return res.json({ data: listExists, notExists })
          })
          .catch((err) => {
            log('err XLS File:', err)

            return res.json({ data: [], message: 'Fail', error: err })
          })

        return true
      })

      return true
    })

    return true
  } catch (error) {
    return next(error)
  }
}

const AttachmentPO = (req, res, next) => {
  try {
    const formidable = require('formidable')
    const form = formidable({ multiples: true })
    const fs = require('fs')

    form.parse(req, (err, fields, files) => {
      if (err) {
        return next(err)
      }
      const oldPath = files.filetoupload.path
      const nameFile = getFormatFileName(fields.quoNo, files.filetoupload.name)

      const newPath = `./public/file/${fields ? nameFile : files.filetoupload.name
        }`

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          return next(err)
        }

        return res.json({
          newPath: normalizeURL(
            `${URL}:${PORT}/${newPath.replace('public/', '')}`,
          ),
        })
      })

      return true
    })

    return true
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  XLSItem,
  XLSPriceContract,
  AttachmentPO,
}
