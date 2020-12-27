const fina = require('../../app/controllers/fina')
const { ValidateUser } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async GetItem(_, { input }, { user }) {
      await ValidateUser(user)

      return fina.GetMasterItem(input, user)
    },
  },
}

module.exports = resolvers
