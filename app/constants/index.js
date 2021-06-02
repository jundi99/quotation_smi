const STOCK = 'STOCK'
const StatusMessage = {
  SUCCESS: 'Success',
  FAIL: 'Fail',
}

const StatusQuo = {
  QUEUE: 'Queue', // assign when create new quotation
  PROCESSED: 'Processed', // assign when SO in web already confirmed
  SENT: 'Sent', // assign when fina already processed SO to SI, and status in FINA = 'Processed'
  DELIVERED: 'Delivered', // assign when user press btn "sudah diterima"
  CLOSED: 'Closed', // assign when fina closed the SO
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
