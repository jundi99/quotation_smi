/* eslint-disable max-lines-per-function */
const {
  SMIModels: { Menu },
} = require('./index')
const { ObjectId } = require('mongoose').Types
const importExcel = {
  children: [
    {
      children: [],
      icon: 'items',
      _id: ObjectId(),
      title: 'Items',
      translate: 'Barang',
      type: 'import',
      url: 'SyncItem',
    },
    {
      children: [],
      icon: 'item_category',
      _id: ObjectId(),
      title: 'Item Category',
      translate: 'Kategori Barang',
      type: 'import',
      url: 'SyncItemCategory',
    },
    {
      children: [],
      icon: 'customer',
      _id: ObjectId(),
      title: 'Customer',
      translate: 'Pelanggan',
      type: 'import',
      url: 'SyncCustomer',
    },
    {
      children: [],
      icon: 'salesman',
      _id: ObjectId(),
      title: 'Salesman',
      translate: 'Penjual',
      type: 'import',
      url: 'SyncSalesman',
    },
    {
      children: [],
      icon: 'term',
      _id: ObjectId(),
      title: 'Terms',
      translate: 'Termin',
      type: 'import',
      url: 'SyncTerm',
    },
    {
      children: [],
      icon: 'user',
      _id: ObjectId(),
      title: 'Users',
      translate: 'Pengguna',
      type: 'import',
      url: 'SyncUser',
    },
  ],
  title: 'Import',
  translate: 'Impor',
  type: 'group',
  id: 'ImportMenu',
}

const CreateMenu = async () => {
  await new Menu(importExcel).save()

  const user = {
    icon: 'user',
    title: 'User',
    translate: 'Pengguna',
    type: 'user',
    url: 'SyncUser',
    id: 'UserMenu',
  }

  await new Menu(user).save()

  const customer = {
    icon: 'customer',
    title: 'Customer',
    translate: 'Pelanggan',
    type: 'customer',
    url: 'GetCustomer',
    id: 'CustomerMenu',
  }

  await new Menu(customer).save()

  const price = {
    icon: 'price',
    title: 'Price',
    translate: 'Harga',
    type: 'price',
    url: 'GetPrice',
    id: 'PriceMenu',
  }

  await new Menu(price).save()

  const quotation = {
    icon: 'quotation',
    title: 'Quotation',
    translate: 'Surat Penawaran',
    type: 'quotation',
    url: 'GetQuotation',
    id: 'QuotationMenu',
  }

  await new Menu(quotation).save()

  const salesOrder = {
    icon: 'salesorder',
    title: 'Sales Order',
    translate: 'Order Penjualan',
    type: 'salesorder',
    url: 'GetSalesOrder',
    id: 'SalesOrderMenu',
  }

  await new Menu(salesOrder).save()

  const itemStock = {
    icon: 'itemstock',
    title: 'Item Stock',
    translate: 'Stok Barang',
    type: 'itemstock',
    url: 'GetItemStock',
    id: 'ItemStockMenu',
  }

  await new Menu(itemStock).save()
}

module.exports = {
  CreateMenu,
}
