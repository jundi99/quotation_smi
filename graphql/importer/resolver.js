const {
  SMIModels: { User },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')
const fina = require('../../app/controllers/fina')
const ValidateUser = async (user) => {
  if (user) {
    return await User.findOne({ _id: user.id }).lean()
  }
  throw new StandardError("Sorry, you're not an authenticated user!")
}

const resolvers = {
  Mutation: {
    async SyncUser(_, args, { user }) {
      try {
        await ValidateUser(user)
        return await fina.SyncUser()
      } catch (err) {
        throw err
      }
    },
  },
}

module.exports = resolvers
