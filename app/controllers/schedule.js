/* eslint-disable prefer-destructuring */
const { SyncMasterItem } = require('./fina')
let timerId = 0
const {
  SMIModels: { Schedule },
} = require('../daos')
const { STOCK } = require('../constan')
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
    SyncMasterItem(options)
  }
  timerId = setInterval(() => {
    log(`${new Date()} | new timer: ${timer}`)
    SyncMasterItem(options)
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

module.exports = {
  UpdateTimerStock,
  GetSchedule,
}
