const { SyncMasterItem } = require('./fina')
let timerId = 0
const {
  SMIModels: { Schedule },
} = require('../daos')
const STOCK = 'STOCK'
const { log } = console
const autoUpdateStock = async () => {
  const schedule = await Schedule.findOne({ name: STOCK }).lean()

  const timer = schedule && schedule.timer ? schedule.timer : 10000

  timerId = setInterval(() => {
    log(`${new Date()} | new timer: ${timer}`)
    SyncMasterItem()
  }, timer)

  return timerId
}

autoUpdateStock()

const UpdateTimerStock = async (body) => {
  clearInterval(timerId)
  const timer = body.minutes * 1000 * 60
  const data = {
    ...body,
    timer,
    name: STOCK,
  }

  await Schedule.updateOne({ name: STOCK }, data, { upsert: true })
  await autoUpdateStock()

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
