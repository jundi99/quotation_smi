/* eslint-disable prefer-destructuring */
const customer = require('../../app/controllers/customer')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetCustomers(_, { input }, { user }) {
      await ValidateUser(user)

      return customer.GetCustomers(input)
    },
    async GetCustomer(_, { input }, { user }) {
      await ValidateUser(user)

      return customer.GetCustomer(input)
    },
  },
  Mutation: {
    async UpsertCustomer(_, { input }, { user }) {
      await ValidateUser(user)

      return customer.UpsertCustomer(input)
    },
    async DeleteCustomer(_, { input }, { user }) {
      await ValidateUser(user)

      return customer.DeleteCustomer(input)
    },
    async UpsertCustCategory(_, { input }, { user }) {
      await ValidateUser(user)

      return customer.UpsertCustCategory(input)
    },
  },
}

module.exports = resolvers
