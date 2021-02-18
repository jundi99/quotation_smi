/* eslint-disable prefer-destructuring */
const { SyncMasterItem, CheckQuoProceed } = require('./fina')
const { CheckQuotationExpired, NotifExpireQuotation } = require('./quotation')
let timerId = 0
const {
  SMIModels: { Schedule },
} = require('../daos')
const { STOCK } = require('../constants')
const { log } = console
const autoUpdateStock = async (directRun) => {
  const schedule = await Schedule.findOne({ name: STOCK }).lean()

  const timer = schedule && schedule.timer ? schedule.timer : 10000

  const dbFina = schedule && schedule.dbFina ? schedule.dbFina.split(',') : []
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
    SyncMasterItem(options, { bypass: true })
    CheckQuoProceed()
  }
  timerId = setInterval(() => {
    log(`${new Date()} | new timer: ${timer}`)
    SyncMasterItem(options, { bypass: true })
    CheckQuoProceed()
  }, timer)

  return timerId
}

autoUpdateStock(true)

const UpdateTimerStock = async (body) => {
  clearInterval(timerId)
  const timer = body.minutes * 1000 * 60
  const data = {
    ...body,
    timer,
    name: STOCK,
  }

  await Schedule.updateOne({ name: STOCK }, data, { upsert: true })
  await autoUpdateStock(false)

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
