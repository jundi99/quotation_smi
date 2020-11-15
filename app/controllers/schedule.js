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

const UpdateTimerStock = async (minutes) => {
  clearInterval(timerId)
  const timer = minutes * 1000 * 60

  await Schedule.findOneAndUpdate(
    { name: STOCK },
    { name: STOCK, timer },
    { upsert: true },
  )
  await autoUpdateStock()

  return { message: 'OK' }
}

module.exports = {
  UpdateTimerStock,
}
