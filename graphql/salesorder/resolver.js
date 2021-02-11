/* eslint-disable prefer-destructuring */
const salesOrder = require('../../app/controllers/salesorder')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GenerateCreditLimitPassword(_, args, { user }) {
      await ValidateUser(user)

      return salesOrder.GenerateCreditLimitPassword()
    },
  },
  Mutation: {
    async UpdateSO(_, { input }, { user }) {
      await ValidateUser(user)

      return salesOrder.UpdateSO(input)
    },
    async ValidatePasswordCredit(_, { input }, { user }) {
      await ValidateUser(user)

      return salesOrder.ValidatePasswordCredit(input)
    },
  },
}

module.exports = resolvers
