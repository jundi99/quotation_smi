const {
  SMIModels: { User },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')
const fina = require('../../app/controllers/fina')
const ValidateUser = (user) => {
  if (user) {
    return User.findOne({ _id: user.id }).lean()
  }
  throw new StandardError("Sorry, you're not an authenticated user!")
}

const resolvers = {
  Mutation: {
    async SyncUser(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterUser()
    },
    async SyncItem(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterItem()
    },
    async SyncItemCategory(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterItemCategory()
    },
    async SyncCustomer(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterCustomer()
    },
    async SyncCustType(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterCustType()
    },
  },
}

module.exports = resolvers
