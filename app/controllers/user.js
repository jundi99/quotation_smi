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
  const userUpdated = await User.findOneAndUpdate(
    { _id },
    { $set: body },
  ).lean()
  const dataResponse = {
    success: false,
  }

  if (userUpdated) {
    dataResponse.success = true
  }

  return dataResponse
}

module.exports = {
  ValidateUser,
  CurrentMenu,
  UpdateUserById,
}
