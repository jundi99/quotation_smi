const { ValidateUser } = require('../../app/controllers/user')
const { UpdateTimerStock } = require('../../app/controllers/schedule')
const resolvers = {
  Mutation: {
    async UpdateScheduleStock(_, { minutes }, { user }) {
      await ValidateUser(user)

      return UpdateTimerStock(minutes)
    },
  },
}

module.exports = resolvers
