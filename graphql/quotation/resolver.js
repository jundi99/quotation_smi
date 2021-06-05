/* eslint-disable prefer-destructuring */
const quotation = require('../../app/controllers/quotation')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetQuotations(_, { input }, { user }) {
      user = await ValidateUser(user)
      if (user.profile.userLevel === 2) {
        input.personNo = user.personNo
      }

      return quotation.GetQuotations(input)
    },
    async GetQuotation(_, { input }, { user }) {
      await ValidateUser(user)

      return quotation.GetQuotation(input)
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
    async BuyItemQuoAgain(_, { quoNo }, { user }) {
      await ValidateUser(user)

      return quotation.BuyItemQuoAgain(quoNo)
    },
  },
}

module.exports = resolvers
