const { ValidateUser } = require('../../app/controllers/user')
const term = require('../../app/controllers/term')

const resolvers = {
  Query: {
    async GetTerms(_, { input }, { user }) {
      await ValidateUser(user)

      return term.GetTerms(input)
    },
  },

  Mutation: {
    async UpsertTerm(_, { input }, { user }) {
      await ValidateUser(user)

      return term.UpsertTerm(input)
    },
    async DeleteTerm(_, { _id }, { user }) {
      await ValidateUser(user)

      return term.DeleteTerm({ _id })
    },
  },
}

module.exports = resolvers
