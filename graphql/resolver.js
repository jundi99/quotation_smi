const {
  SMIModels: { User },
} = require('../app/daos')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const StandardError = require('../utils/standard_error')

const resolvers = {
  Query: {
    async current(_, args, { user }) {
      if (user) {
        return await User.findOne({ _id: user.id }).lean()
      }
      throw new Error("Sorry, you're not an authenticated user!")
    },
  },

  Mutation: {
    async register(_, { login, password }) {
      let user = await User.findOne({ userName: login }).lean()
      if (user) {
        throw new StandardError('Username sudah ada', 409)
      }
      user = await User.create({
        userName: login,
        encrypted_password: password,
      })

      return jsonwebtoken.sign(
        { id: user._id, userName: user.userName },
        JWT_SECRET,
        {
          expiresIn: '3m',
        }
      )
    },

    async login(_, { login, password }) {
      const user = await User.findOne({ userName: login })

      if (!user) {
        throw new Error(
          "This user doesn't exist. Please, make sure to type the right login."
        )
      }

      const valid = await user.comparePassword(password)

      if (!valid) {
        throw new Error('You password is incorrect!')
      }

      return jsonwebtoken.sign(
        { id: user.id, userName: user.userName },
        JWT_SECRET,
        {
          expiresIn: '1d',
        }
      )
    },
  },
}

module.exports = resolvers
