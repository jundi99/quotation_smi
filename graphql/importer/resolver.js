const fina = require('../../app/controllers/fina')
const { ValidateUser } = require('../../app/controllers/user')

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
    async SyncSalesman(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterSalesman()
    },
    async SyncTerm(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterTerm()
    },
  },
}

module.exports = resolvers
