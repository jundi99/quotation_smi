/* eslint-disable prefer-destructuring */
const fina = require('../../app/controllers/fina')
const { ValidateUser } = require('../../app/controllers/user')
const {
  SMIModels: { Schedule },
} = require('../../app/daos')
const { STOCK } = require('../../app/constants')

const resolvers = {
  Mutation: {
    async SyncItem(_, { cache }, { user }) {
      await ValidateUser(user)
      const schedule = await Schedule.findOne(
        { name: STOCK },
        { dbFina: 1 },
      ).lean()

      const dbFina =
        schedule && schedule.dbFina ? schedule.dbFina.split(',') : []
      let options = {}

      if (dbFina.length === 3) {
        const host = dbFina[0]
        const port = dbFina[1]
        const database = dbFina[2]

        options = {
          host,
          port,
          database,
        }
      }

      return fina.SyncMasterItem(options, cache, user)
    },
    async SyncItemCategory(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterItemCategory(user)
    },
    async SyncCustomer(_, { cache }, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterCustomer(user, cache)
    },
    async SyncSalesman(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterSalesman(user)
    },
    async SyncUser(_, args, { user }) {
      await ValidateUser(user)

      return fina.SyncMasterUser(user)
    },
  },
}

module.exports = resolvers
