const { ValidateUser } = require('../../app/controllers/user')
const {
  UpdateTimerStock,
  GetSchedule,
} = require('../../app/controllers/schedule')
const resolvers = {
  Query: {
    async GetSchedule(_, args, { user }) {
      await ValidateUser(user)

      return GetSchedule()
    },
  },
  Mutation: {
    async UpdateScheduleStock(_, { input }, { user }) {
      await ValidateUser(user)

      return UpdateTimerStock(input)
    },
  },
}

module.exports = resolvers
