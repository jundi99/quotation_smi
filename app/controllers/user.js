const {
  SMIModels: { User, Menu },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')
const ValidateUser = (user) => {
  if (user) {
    return User.findOne({ _id: user.id }).lean()
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

const UpdateUserById = async (_id, body) => {
  const user = await User.findOne({ _id }).lean()

  body = _.merge(user, body)
  const userUpdated = await User.updateOne({ _id }, body).lean()
  const dataResponse = {
    success: false,
  }

  if (userUpdated.nModified === 1) {
    dataResponse.success = true
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

  const users = await User.find({
    $or: [
      { userName: new RegExp(q, 'gi') },
      { 'profile.fullName': new RegExp(q, 'gi') },
    ],
  })
    .sort({ userId: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return users
}

module.exports = {
  ValidateUser,
  CurrentMenu,
  UpdateUserById,
  GetUsers,
}
