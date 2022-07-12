/* eslint-disable prefer-destructuring */
const salesman = require('../../app/controllers/salesman')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetSalesmen(_, { input }, { user }) {
      await ValidateUser(user)

      return salesman.GetSalesmen(input)
    },
  },
  Mutation: {
    async UpdateSalesman(_, { input }, { user }) {
      await ValidateUser(user)

      return salesman.UpdateSalesman(input)
    },
  },
}

module.exports = resolvers
