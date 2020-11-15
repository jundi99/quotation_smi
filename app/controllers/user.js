const {
  SMIModels: { User },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')

const ValidateUser = (user) => {
  if (user) {
    return User.findOne({ _id: user.id }).lean()
  }
  throw new StandardError("Sorry, you're not an authenticated user!")
}

module.exports = {
  ValidateUser,
}
