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
    async GetItemsQuo(_, { input }, { user }) {
      user = await ValidateUser(user)

      return item.GetItemsQuo(input, user)
    },
    async GetStatusItem(_, { input }, { user }) {
      await ValidateUser(user)

      return item.GetStatusItem(input)
    },
  },
}

module.exports = resolvers
