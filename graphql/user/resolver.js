const {
  SMIModels: { User },
} = require('../../app/daos')
// const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const { JWT_SECRET } = process.env
// const StandardError = require('../../utils/standard_error')
const { CurrentMenu } = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async CurrentUserMenu(_, args, { user }) {
      if (user) {
        const currentUser = await User.findOne({ _id: user.id }).lean()

        return CurrentMenu(currentUser)
      }
      throw new Error('Maaf, anda tidak memiliki akses!')
    },
  },

  Mutation: {
    // async register(_, { login, password }) {
    //   let user = await User.findOne({ userName: login }).lean()
    //   if (user) {
    //     throw new StandardError('Username sudah ada', 409)
    //   }
    //   user = await User.create({
    //     userName: login,
    //     encryptedPassword: password,
    //   })

    //   return jsonwebtoken.sign(
    //     { id: user._id, userName: user.userName },
    //     JWT_SECRET,
    //     {
    //       expiresIn: '30d',
    //     }
    //   )
    // },

    async Login(_, { login, password }) {
      const user = await User.findOne({ userName: login })

      if (!user) {
        throw new Error(
          'User ini tidak ada. Harap pastikan untuk mengetik login yang benar.',
        )
      }

      const valid = await user.comparePassword(password)

      if (!valid) {
        throw new Error('Password anda salah!')
      }

      return {
        token: jsonwebtoken.sign(
          { id: user.id, userName: user.userName },
          JWT_SECRET,
          {
            expiresIn: '30d',
          },
        ),
        current: user,
      }
    },
  },
}

module.exports = resolvers
