/* eslint-disable prefer-destructuring */
const quotation = require('../../app/controllers/quotation')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetQuotations(_, { input }, { user }) {
      await ValidateUser(user)

      return quotation.GetQuotations(input)
    },
    async GetQuotation(_, { input }, { user }) {
      await ValidateUser(user)

      return quotation.GetQuotation(input)
    },
    async GetDeliveryOption(_, args, { user }) {
      await ValidateUser(user)

      return quotation.GetDeliveryOption()
    },
  },
  Mutation: {
    async UpsertQuotation(_, { input }, { user }) {
      await ValidateUser(user)

      return quotation.UpsertQuotation(input)
    },
    async DeleteQuotation(_, { input }, { user }) {
      await ValidateUser(user)

      return quotation.DeleteQuotation(input)
    },
  },
}

module.exports = resolvers
