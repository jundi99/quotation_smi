/* eslint-disable prefer-destructuring */
const { SyncMasterItem, CheckQuoProceed } = require('./fina')
const { CheckQuotationExpired, NotifExpireQuotation } = require('./quotation')
let timerId = 0
const {
  SMIModels: { Schedule },
} = require('../daos')
const { STOCK } = require('../constants')
const { log } = console
const StandardError = require('../../utils/standard_error')
const { UpdateStockSupplierXls } = require('./item')
const { REDIS_URI, REDIS_PORT } = process.env
const asyncRedis = require('async-redis')
const redis = asyncRedis.createClient(REDIS_PORT, REDIS_URI)

const autoUpdateStock = async (directRun) => {
  const schedule = await Schedule.findOne({ name: STOCK }).lean()

  const timer = schedule && schedule.timer ? schedule.timer : 10000

  const dbFina = schedule && schedule.dbFina ? schedule.dbFina.split(';') : []
  let options = {}

  if (dbFina.length === 3) {
    const host = dbFina[0]
    const port = dbFina[1]
    const database = dbFina[2]

    options = {
      host,
      port,
      database,
    }
  }

  if (directRun) {
    if (options.host) {
      SyncMasterItem(options, false, { bypass: true })
    } else if (schedule && schedule.fileXLS) {
      redis.del('syncItem')
      UpdateStockSupplierXls(schedule.fileXLS)
    }
    CheckQuoProceed()
  }
  timerId = setInterval(() => {
    log(`${new Date()} | new timer: ${timer}`)
    if (options.host) {
      SyncMasterItem(options, false, { bypass: true })
    } else if (schedule && schedule.fileXLS) {
      redis.del('syncItem')
      UpdateStockSupplierXls(schedule.fileXLS)
    }
    CheckQuoProceed()
  }, timer)

  return timerId
}

autoUpdateStock(true)

const UpdateTimerStock = async (body) => {
  clearInterval(timerId)
  const timer = body.minutes * 1000 * 60

  if (body.dbFina) {
    const dbFina = body.dbFina ? body.dbFina.split(';') : []

    if (dbFina.length !== 3) {
      throw new StandardError('Letak database tidak di izinkan')
    }
    body.fileXLS = null
  } else {
    body.dbFina = null
  }

  const data = {
    ...body,
    timer,
    name: STOCK,
  }

  await Schedule.updateOne({ name: STOCK }, data, { upsert: true })
  await autoUpdateStock(true)

  return { message: 'OK' }
}

const GetSchedule = async () => {
  const schedule = await Schedule.findOne({ name: STOCK }).lean()

  schedule.minutes = schedule.timer / 1000 / 60

  return schedule
}

const CheckTaskEveryDay = () => {
  const schedule = require('node-schedule')
  const rule = new schedule.RecurrenceRule()

  rule.hour = 0
  rule.minute = 0

  schedule.scheduleJob(rule, async () => {
    log(`task every day ${new Date()}`)
    await CheckQuotationExpired()
    await NotifExpireQuotation()
  })
}

CheckTaskEveryDay()

module.exports = {
  UpdateTimerStock,
  GetSchedule,
}
