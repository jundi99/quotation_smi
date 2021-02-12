const {
  SMIModels: { User, Customer },
} = require('../../app/daos')
// const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const { JWT_SECRET } = process.env
const StandardError = require('../../utils/standard_error')
const {
  CurrentMenu,
  ValidateUser,
  UpdateUserById,
  GetUsers,
  ChangePassword,
} = require('../../app/controllers/user')

const resolvers = {
  Query: {
    async CurrentUserMenu(_, args, { user }) {
      if (user) {
        const currentUser = await ValidateUser(user)

        return CurrentMenu(currentUser)
      }
      throw new StandardError('Maaf, anda tidak memiliki akses!')
    },
    GetUser(_, args, { user }) {
      return ValidateUser(user)
    },
    async GetUsers(_, { input }, { user }) {
      user = await ValidateUser(user)
      if (!user || user.profile.userLevel !== 0) {
        throw new StandardError('Maaf, anda tidak memiliki akses!')
      }

      return GetUsers(input)
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
    async UpdateUserById(_, { userId, input }, { user }) {
      user = await ValidateUser(user)
      if (user.profile.userLevel !== 0) {
        throw new StandardError('Maaf, anda tidak memiliki akses!')
      }

      return UpdateUserById(userId, input)
    },
    async Login(_, { login, password }) {
      const user = await User.findOne({ userName: login })
      const customer = await Customer.findOne({ userName: login })
      let valid = null
      let validUser

      if (user) {
        valid = await user.comparePassword(password)
        validUser = user
      } else if (customer) {
        valid = await customer.comparePassword(password)
        validUser = customer
      } else {
        throw new StandardError(
          'User ini tidak ada. Harap pastikan untuk mengetik login yang benar.',
        )
      }

      if (!valid) {
        throw new StandardError('Password anda salah!')
      }

      return {
        token: jsonwebtoken.sign(
          { id: validUser.id, userName: validUser.userName },
          JWT_SECRET,
          {
            expiresIn: '30d',
          },
        ),
        current: validUser,
      }
    },
    async ChangePassword(_, { input }, { user }) {
      user = await ValidateUser(user)

      return ChangePassword(user, input)
    },
  },
}

module.exports = resolvers
