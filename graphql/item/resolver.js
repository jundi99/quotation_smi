const fina = require('../../app/controllers/fina')
const item = require('../../app/controllers/item')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetItems(_, { input }, { user }) {
      await ValidateUser(user)

      return fina.GetItems(input, user)
    },
    async GetItemCategories(_, { input }, { user }) {
      await ValidateUser(user)

      return item.GetItemCategories(input)
    },
  },
}

module.exports = resolvers
