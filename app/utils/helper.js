const {
  SMIModels: { ItemCategory, Salesman, Term },
} = require('../daos')

const NewItem = async (data) => {
  let category = {}

  if (data.CATEGORYID) {
    category = await ItemCategory.findOne(
      { categoryId: data.CATEGORYID },
      { _id: 1 },
    ).lean()
  }

  const newData = {
    itemNo: data.ITEMNO,
    name: data.ITEMDESCRIPTION,
    unit: data.UNIT1,
    reserved: {
      item1: data.RESERVED1,
      item2: data.RESERVED2,
      item3: data.RESERVED3,
      item4: data.RESERVED4,
      item5: data.RESERVED5,
      item6: data.RESERVED6,
      item7: data.RESERVED7,
      item8: data.RESERVED8,
      item9: data.RESERVED9,
      item10: data.RESERVED10,
    },
    price: {
      level1: data.UNITPRICE,
      level2: data.UNITPRICE2,
      level3: data.UNITPRICE3,
      level4: data.UNITPRICE4,
      level5: data.UNITPRICE5,
    },
    quantity: data.QUANTITY,
    note: data.NOTES,
    weigth: data.WEIGTH,
    dimension: {
      width: data.DIMWIDTH,
      heigth: data.DIMHEIGHT,
      depth: data.DIMDEPTH,
    },
    category: category._id,

    stockSMI: data.STOCKSMI,
  }

  return newData
}

const NewUser = (user) => {
  let authorizeUser = {}
  const CRUD = {
    create: true,
    edit: true,
    delete: true,
    print: true,
  }

  if (user.USERLEVEL === 0) {
    authorizeUser = {
      item: CRUD,
      itemCategory: CRUD,
      customer: CRUD,
      custCategory: CRUD,
      price: CRUD,
      salesman: CRUD,
      user: CRUD,
      itemStock: CRUD,
      quotation: CRUD,
      priceApproval: CRUD,
      salesOrder: CRUD,
      importExcel: CRUD,
    }
  } else if (user.USERLEVEL === 2) {
    authorizeUser.quotation = CRUD
    authorizeUser.salesOrder = CRUD
  }
  const newData = {
    userName: user.USERNAME,
    encryptedPassword: user.USERNAME,
    userId: user.ID,
    profile: {
      fullName: user.FULLNAME,
      userLevel: user.USERLEVEL,
    },
    authorize: authorizeUser,
  }

  return newData
}

const NewCustomer = async (customer) => {
  const salesman = customer.SALESMANID
    ? await Salesman.findOne({ salesmanId: customer.SALESMANID }, { _id: 1 })
    : {}
  const term = customer.TERMSID
    ? await Term.findOne({ termId: customer.TERMSID }, { _id: 1 })
    : {}
  const newData = {
    customerId: customer.ID,
    personNo: customer.PERSONNO,
    name: customer.NAME,
    address: {
      addressLine1: customer.ADDRESSLINE1,
      addressLine2: customer.ADDRESSLINE2,
      city: customer.CITY,
      stateProve: customer.STATEPROVE,
      zipCode: customer.ZIPCODE,
      country: customer.COUNTRY,
    },
    contact: customer.CONTACT,
    phone: customer.PHONE,
    email: customer.EMAIL,
    creditLimit: customer.CREDITLIMIT,
    note: customer.NOTES,
    outstandingAR: 0,
    priceType: [],
    salesman: salesman._id,
    term: term._id,
    isTax: customer.TAX1ID !== null,
  }

  return newData
}

module.exports = {
  NewItem,
  NewUser,
  NewCustomer,
}
