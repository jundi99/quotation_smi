class StandardError extends Error {
  constructor(message, statusCode = 400, lastError, errorContext) {
    super(message)

    this.statusCode = statusCode
    this.stack = Error().stack
    this.lastError = lastError || null
    this.errorContext = errorContext || {}

    Error.captureStackTrace(this, StandardError)

    if (this.lastError) {
      this.stack += `\n-\n${lastError.stack}`
    }
  }
}

module.exports = StandardError
