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

Object.freeze(STOCK)
Object.freeze(StatusMessage)

module.exports = {
  STOCK,
  StatusMessage,
  StatusQuo,
}
