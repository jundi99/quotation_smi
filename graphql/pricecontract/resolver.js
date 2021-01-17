/* eslint-disable prefer-destructuring */
const priceContract = require('../../app/controllers/pricecontract')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetPriceContracts(_, { input }, { user }) {
      await ValidateUser(user)

      return priceContract.GetPriceContracts(input)
    },
    async GetPriceContract(_, { input }, { user }) {
      await ValidateUser(user)

      return priceContract.GetPriceContract(input)
    },
    async GetPriceTypes(_, args, { user }) {
      await ValidateUser(user)

      return priceContract.GetPriceTypes(user)
    },
  },
  Mutation: {
    async UpsertPriceContract(_, { input }, { user }) {
      await ValidateUser(user)

      return priceContract.UpsertPriceContract(input)
    },
    async DeletePriceContract(_, { input }, { user }) {
      await ValidateUser(user)

      return priceContract.DeletePriceContract(input)
    },
  },
}

module.exports = resolvers
