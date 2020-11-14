module.exports.User = `
  userName: String
  userId: Int  
  profile: Profile
  ipHistory: IpHistory
  authorize: AuthorizeUser
`
module.exports = `
  type CRUD {
    create: Boolean
    edit: Boolean
    delete: Boolean
    print: Boolean
  }

  type AuthorizeUser {
    item: CRUD
    itemCategory: CRUD
    customer: CRUD
    custCategory: CRUD
    price: CRUD
    sales: CRUD
    user: CRUD
    itemStock: CRUD
    quotation: CRUD
    priceApproval: CRUD
    salesOrder: CRUD
    importExcel: CRUD
  }

  type Profile {
    fullName: String
    userLevel: Int
  }
  
  type IpHistory {
      _id: ID!
      device_type: String
      device_id: String
      date: String
  }

  type User {
    ${module.exports.User}
  }

  type SyncResponse {
    total: Int
    newData: Int
    message: String
  }

  type Mutation {
    SyncUser: SyncResponse
    SyncItem: SyncResponse
    SyncItemCategory: SyncResponse
    SyncCustomer: SyncResponse
    SyncCustType: SyncResponse
  }
`
