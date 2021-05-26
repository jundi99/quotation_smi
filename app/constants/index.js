const STOCK = 'STOCK'
const StatusMessage = {
  SUCCESS: 'Success',
  FAIL: 'Fail',
}

const StatusQuo = {
  QUEUE: 'Queue',
  PROCESSED: 'Processed',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  CLOSED: 'Closed',
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
