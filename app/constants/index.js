const STOCK = 'STOCK'
const StatusMessage = {
  SUCCESS: 'Success',
  FAIL: 'Fail',
}

const StatusQuo = {
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  QUEUE: 'Queue',
  CLOSED: 'Closed',
  PROCESSED: 'Processed',
}

const FAIL_SYNC_SERVER = 'Gagal sync ke server Fina'

Object.freeze(STOCK)
Object.freeze(StatusMessage)

module.exports = {
  STOCK,
  StatusMessage,
  StatusQuo,
  FAIL_SYNC_SERVER,
}
