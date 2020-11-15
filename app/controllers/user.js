const {
  SMIModels: { User },
} = require('../../app/daos')
const StandardError = require('../../utils/standard_error')

const ValidateUser = (user) => {
  if (user) {
    return User.findOne({ _id: user.id }).lean()
  }
  throw new StandardError('Maaf, anda tidak memiliki akses!')
}

const importExcel = {
  children: [
    {
      children: [],
      icon: 'items',
      id: 1,
      title: 'Items',
      translate: 'Barang',
      type: 'import',
      url: 'SyncItem',
    },
    {
      children: [],
      icon: 'item_category',
      id: 2,
      title: 'Item Category',
      translate: 'Kategori Barang',
      type: 'import',
      url: 'SyncItemCategory',
    },
    {
      children: [],
      icon: 'customer',
      id: 3,
      title: 'Customer',
      translate: 'Pelanggan',
      type: 'import',
      url: 'SyncCustomer',
    },
    {
      children: [],
      icon: 'customer_type',
      id: 4,
      title: 'Customer Type',
      translate: 'Tipe Pelanggan',
      type: 'import',
      url: 'SyncCustType',
    },
    {
      children: [],
      icon: 'salesman',
      id: 5,
      title: 'Salesman',
      translate: 'Penjual',
      type: 'import',
      url: 'SyncSalesman',
    },
    {
      children: [],
      icon: 'term',
      id: 6,
      title: 'Terms',
      translate: 'Termin',
      type: 'import',
      url: 'SyncTerm',
    },
    {
      children: [],
      icon: 'user',
      id: 7,
      title: 'Users',
      translate: 'Pengguna',
      type: 'import',
      url: 'SyncUser',
    },
  ],
  title: 'Import',
  translate: 'Impor',
  type: 'group',
}

const CurrentMenu = (currentUser) => {
  const { authorize } = currentUser
  const data = []

  if (authorize.importExcel.create || authorize.importExcel.edit) {
    data.push(importExcel)
  }

  if (authorize.user.create || authorize.user.edit) {
    const user = {
      icon: 'user',
      id: 8,
      title: 'User',
      translate: 'Pengguna',
      type: 'user',
      url: 'SyncUser',
    }

    data.push(user)
  }

  return data
}

module.exports = {
  ValidateUser,
  CurrentMenu,
}
