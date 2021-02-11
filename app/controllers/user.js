const {
  SMIModels: { User, Menu, Customer },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')
const ValidateUser = async (user) => {
  let validUser

  if (user) {
    validUser = await User.findOne({ _id: user.id }).lean()
    if (!validUser) {
      validUser = await Customer.findOne({ _id: user.id }).lean()
    }

    if (validUser) {
      return validUser
    }
  }

  throw new StandardError('Maaf, anda tidak memiliki akses!')
}
const _ = require('lodash')
const joi = require('joi')

const CurrentMenu = async (currentUser) => {
  const { authorize } = currentUser
  const data = []
  // const { CreateMenu } = require('../daos/setup_menu')

  // await CreateMenu() // once time if needed
  if (authorize.importExcel.create || authorize.importExcel.edit) {
    data.push(await Menu.findOne({ id: 'ImportMenu' }).lean())
  }

  if (authorize.user.create || authorize.user.edit) {
    data.push(await Menu.findOne({ id: 'UserMenu' }).lean())
  }

  if (authorize.customer.create || authorize.customer.edit) {
    data.push(await Menu.findOne({ id: 'CustomerMenu' }).lean())
  }

  if (authorize.price.create || authorize.price.edit) {
    data.push(await Menu.findOne({ id: 'PriceMenu' }).lean())
  }

  if (authorize.quotation.create || authorize.quotation.edit) {
    data.push(await Menu.findOne({ id: 'QuotationMenu' }).lean())
  }

  if (authorize.salesOrder.create || authorize.salesOrder.edit) {
    data.push(await Menu.findOne({ id: 'SalesOrderMenu' }).lean())
  }

  if (authorize.itemStock.create || authorize.itemStock.edit) {
    data.push(await Menu.findOne({ id: 'ItemStockMenu' }).lean())
  }

  return data
}

const UpdateUserById = async (userId, body) => {
  let userUpdated

  if (!userId) {
    throw new StandardError('Maaf, user ini tidak bisa di edit!')
  }
  if (body.profile.userLevel === 2) {
    let customer = await Customer.findOne({ customerId: userId })

    customer = _.merge(customer, body)
    userUpdated = await customer.save()
    // userUpdated = await Customer.updateOne({ userId }, body).lean()
  } else {
    let user = await User.findOne({ userId })

    user = _.merge(user, body)
    switch (body.profile.userLevel) {
      case 1:
        body.profile.nameLevel = 'User'
        break
      case 2:
        body.profile.nameLevel = 'Client'
        break
      default:
        body.profile.nameLevel = 'Admin'
    }
    userUpdated = await user.save()
    // userUpdated = await User.updateOne({ userId }, body).lean()
  }

  const dataResponse = {
    isCreate: userUpdated.isNew,
    success: true,
  }

  return dataResponse
}

const GetUsers = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional().allow(''),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)

  let users = await User.find({
    $or: [
      { userName: new RegExp(q, 'gi') },
      { 'profile.fullName': new RegExp(q, 'gi') },
    ],
  })
    .sort({ userId: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  if (users.length < limit) {
    const filterNum = limit - users.length
    let totSkip = 0

    if (users.length === 0) {
      const countUser = await User.countDocuments()

      totSkip = skip * limit - countUser
      totSkip = totSkip < 0 ? 0 : totSkip
    }

    let customers = await Customer.find({
      $or: [
        { userName: new RegExp(q, 'gi') },
        { 'profile.fullName': new RegExp(q, 'gi') },
      ],
    })
      .sort({ _id: 1 })
      .skip(totSkip)
      .limit(limit)
      .lean()

    customers = customers.filter((val, idx) => idx < filterNum)
    users = [...users, ...customers]
  }

  return users
}

module.exports = {
  ValidateUser,
  CurrentMenu,
  UpdateUserById,
  GetUsers,
}
