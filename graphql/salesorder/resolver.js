/* eslint-disable prefer-destructuring */
const salesOrder = require('../../app/controllers/salesorder')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Mutation: {
    async UpdateSO(_, { input }, { user }) {
      await ValidateUser(user)

      return salesOrder.UpdateSO(input)
    },
  },
}

module.exports = resolvers
