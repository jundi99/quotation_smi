/* eslint-disable max-lines-per-function */
const {
  SMIModels: { Menu },
} = require('./index')

const CreateMenu = async () => {
  const GROUP_TYPE = 'group'
  const ITEM_TYPE = 'item'
  const COLLAPSE_TYPE = 'collapse'
  const home = {
    id: 'home',
    title: 'Home',
    translate: 'Home',
    type: GROUP_TYPE,
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        translate: 'Dashboard',
        type: ITEM_TYPE,
        icon: 'home',
        url: '/home/dashboard',
      },
    ],
  }

  await new Menu(home).save()

  const transaction = {
    id: 'transaction',
    title: 'Transaction',
    translate: 'Transaksi',
    type: 'group',
    children: [],
  }

  await new Menu(transaction).save()

  const transQuo = {
    id: 'transaction-quotation',
    title: 'Quotation',
    translate: 'Quotation',
    type: 'item',
    icon: 'receipt',
    url: '/transactions/quotation',
  }

  await new Menu(transQuo).save()

  const transSO = {
    id: 'transaction-sales-order',
    title: 'Sales Order',
    translate: 'Sales Order',
    type: 'item',
    icon: 'assessment',
    url: '/transactions/sales-order',
  }

  await new Menu(transSO).save()

  const settings = {
    id: 'settings',
    title: 'Settings',
    translate: 'Pengaturan',
    type: 'group',
    children: [],
  }

  await new Menu(settings).save()

  const settingMaster = {
    id: 'master',
    title: 'Master',
    translate: 'Master',
    type: COLLAPSE_TYPE,
    icon: 'settings',
    children: [],
  }

  await new Menu(settingMaster).save()

  const masterUser = {
    id: 'master-user',
    title: 'User',
    translate: 'User',
    type: 'item',
    icon: 'person',
    url: '/settings/users',
  }

  await new Menu(masterUser).save()

  const masterSalesman = {
    id: 'master-salesman',
    title: 'Salesman',
    translate: 'Salesman',
    type: 'item',
    icon: 'emoji_people',
    url: '/settings/salesman',
  }

  await new Menu(masterSalesman).save()

  const masterCust = {
    id: 'master-customer',
    title: 'Customer',
    translate: 'Customer',
    type: 'item',
    icon: 'people',
    url: '/settings/customer',
  }

  await new Menu(masterCust).save()

  const masterGoods = {
    id: 'master-goods',
    title: 'Items',
    translate: 'Items',
    type: 'item',
    icon: 'local_mall',
    url: '/settings/goods',
  }

  await new Menu(masterGoods).save()

  const masterTerms = {
    id: 'master-terms',
    title: 'Terms',
    translate: 'Terms',
    type: 'item',
    icon: 'payments',
    url: '/settings/terms',
  }

  await new Menu(masterTerms).save()

  const changePass = {
    id: 'change-password',
    title: 'Change Password',
    translate: 'Change Password',
    type: 'item',
    icon: 'vpn_key',
    url: '/settings/account',
  }

  await new Menu(changePass).save()
}

module.exports = {
  CreateMenu,
}
