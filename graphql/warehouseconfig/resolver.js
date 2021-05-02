const { ValidateUser } = require('../../app/controllers/user')
const warehouseconfig = require('../../app/controllers/warehouseconfig')
const fina = require('../../app/controllers/fina')

const resolvers = {
  Query: {
    async GetWarehouseConfig(_, args, { user }) {
      await ValidateUser(user)

      return warehouseconfig.GetWarehouseConfig()
    },
    async GetListWarehouse(_, args, { user }) {
      await ValidateUser(user)

      return fina.GetListWarehouse(user)
    },
  },

  Mutation: {
    async UpdateConfigWarehouse(_, { input }, { user }) {
      await ValidateUser(user)

      return warehouseconfig.UpdateConfigWarehouse(input)
    },
  },
}

module.exports = resolvers
