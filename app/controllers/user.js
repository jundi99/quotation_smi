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

const setupAdminMenu = async (data) => {
  data.push(await Menu.findOne({ id: 'home' }).lean())
  const transaction = await Menu.findOne({ id: 'transaction' }).lean()

  transaction.children.push(
    await Menu.findOne({ id: 'transaction-quotation' }).lean(),
    await Menu.findOne({ id: 'transaction-sales-order' }).lean(),
  )

  data.push(transaction)

  const setting = await Menu.findOne({ id: 'settings' }).lean()

  setting.children.push(
    await Menu.findOne({ id: 'master' }).lean(),
    await Menu.findOne({ id: 'change-password' }).lean(),
  )

  setting.children[0].children.push(
    await Menu.findOne({ id: 'master-user' }).lean(),
    await Menu.findOne({ id: 'master-salesman' }).lean(),
    await Menu.findOne({ id: 'master-customer' }).lean(),
    await Menu.findOne({ id: 'master-goods' }).lean(),
    await Menu.findOne({ id: 'master-price' }).lean(),
    await Menu.findOne({ id: 'master-terms' }).lean(),
  )

  data.push(setting)
}

const setupUserMenu = async (data, authorize) => {
  data.push(await Menu.findOne({ id: 'home' }).lean())
  const transaction = await Menu.findOne({ id: 'transaction' }).lean()
  const dataTrans = []

  if (authorize.quotation.view) {
    dataTrans.push(await Menu.findOne({ id: 'transaction-quotation' }).lean())
  }
  if (authorize.salesOrder.view) {
    dataTrans.push(await Menu.findOne({ id: 'transaction-sales-order' }).lean())
  }

  transaction.children = dataTrans

  data.push(transaction)

  const setting = await Menu.findOne({ id: 'settings' }).lean()

  setting.children.push(
    await Menu.findOne({ id: 'master' }).lean(),
    await Menu.findOne({ id: 'change-password' }).lean(),
  )

  const dataSettingChild = []

  if (authorize.user.view) {
    dataSettingChild.push(await Menu.findOne({ id: 'master-user' }).lean())
  }
  if (authorize.salesman.view) {
    dataSettingChild.push(await Menu.findOne({ id: 'master-salesman' }).lean())
  }
  if (authorize.customer.view) {
    dataSettingChild.push(await Menu.findOne({ id: 'master-customer' }).lean())
  }
  if (authorize.item.view) {
    dataSettingChild.push(await Menu.findOne({ id: 'master-goods' }).lean())
  }
  if (authorize.price.view) {
    dataSettingChild.push(await Menu.findOne({ id: 'master-price' }).lean())
  }
  dataSettingChild.push(await Menu.findOne({ id: 'master-terms' }).lean())
  setting.children[0].children = dataSettingChild

  data.push(setting)
}

const setupClienMenu = async (data, authorize) => {
  // data.push(await Menu.findOne({ id: 'home' }).lean())
  const transaction = await Menu.findOne({ id: 'transaction' }).lean()
  const dataTrans = []

  if (authorize.quotation.view) {
    dataTrans.push(await Menu.findOne({ id: 'transaction-quotation' }).lean())
  }
  if (authorize.salesOrder.view) {
    dataTrans.push(await Menu.findOne({ id: 'transaction-sales-order' }).lean())
  }

  transaction.children = dataTrans

  data.push(transaction)

  const setting = await Menu.findOne({ id: 'settings' }).lean()

  setting.children.push(await Menu.findOne({ id: 'change-password' }).lean())

  data.push(setting)
}

const CurrentMenu = async (currentUser) => {
  const { authorize, profile } = currentUser
  const data = []
  // const { CreateMenu } = require('../daos/setup_menu')

  // await CreateMenu() // once time if needed

  if (profile.userLevel === 0) {
    await setupAdminMenu(data)
  } else if (profile.userLevel === 1) {
    await setupUserMenu(data, authorize)
  } else if (profile.userLevel === 2) {
    await setupClienMenu(data, authorize)
  }

  return data
}

const UpdateUserById = async (userId, body) => {
  if (!userId) {
    throw new StandardError('Maaf, user ini tidak bisa di edit!')
  }
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
  const userUpdated = await user.save()

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

  const countUser = await User.countDocuments()
  const countCustomer = await Customer.countDocuments()
  const total = countUser + countCustomer

  if (users.length < limit) {
    const filterNum = limit - users.length
    let totSkip = 0

    if (users.length === 0) {
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

  return { users, total }
}

const ChangePassword = async (user, body) => {
  const { currentPassword, newPassword, confirmNewPassword } = await joi
    .object({
      currentPassword: joi.string().required(),
      newPassword: joi.string().required(),
      confirmNewPassword: joi.string().required(),
    })
    .validateAsync(body)

  if (newPassword !== confirmNewPassword) {
    throw new StandardError('Password baru tidak sama')
  }

  const { userName } = user
  const compareSavePassword = async (model) => {
    const data = await model.findOne({ userName })

    if (data && (await data.comparePassword(currentPassword))) {
      data.encryptedPassword = newPassword
      await data.save()

      return 'Data saved'
    }
    throw new StandardError('Password yang anda masukkan salah')
  }

  if (user.personNo) {
    return compareSavePassword(Customer)
  }

  return compareSavePassword(User)
}

module.exports = {
  ValidateUser,
  CurrentMenu,
  UpdateUserById,
  GetUsers,
  ChangePassword,
}
