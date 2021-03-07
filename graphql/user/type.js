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
    view: Boolean
    name: String
  }

  type AuthorizeUser {
    item: CRUD
    itemCategory: CRUD
    customer: CRUD
    custCategory: CRUD
    price: CRUD
    salesman: CRUD
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
    nameLevel: String
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

  type SubMenu {
    _id: ID
    id: String
    icon: String
    title: String
    translate: String
    type: String
    url: String
    children : [SubMenu]    
  }

  type MenuResponse {
    title: String
    translate: String
    type: String
    icon: String
    url: String
    _id: ID
    id: String
    children : [SubMenu]
  }

  input GetUsersInput {
    q: String
    skip: Int
    limit: Int
  }
  
  type MixUserCust {
    ${module.exports.User}    
    personNo: String
  }

  type Query {
    CurrentUserMenu: [MenuResponse]
    GetUser: User
    GetUsers(input: GetUsersInput): [MixUserCust]
  }

  type LoginResponse {
    token: String
    current: MixUserCust
  }

  type UpdateUserByIdResponse {
    success: Boolean    
  }

  input ProfileInput {
    fullName: String
    userLevel: Int
  }

  input CRUDInput {
    create: Boolean
    edit: Boolean
    delete: Boolean
    print: Boolean
    view: Boolean
    name: String
  }

  input AuthorizeUserInput {
    item: CRUDInput
    itemCategory: CRUDInput
    customer: CRUDInput
    custCategory: CRUDInput
    price: CRUDInput
    salesman: CRUDInput
    user: CRUDInput
    itemStock: CRUDInput
    quotation: CRUDInput
    priceApproval: CRUDInput
    salesOrder: CRUDInput
    importExcel: CRUDInput    
  }

  input UpdateUserByIdInput {
    userName: String
    profile: ProfileInput   
    authorize: AuthorizeUserInput     
  }

  input ChangePasswordInput {
    currentPassword: String
    newPassword: String
    confirmNewPassword: String
  }

  type Mutation {
    #register(login: String!, password: String!): String
    Login(login: String!, password: String!): LoginResponse
    UpdateUserById(userId: ID!, input: UpdateUserByIdInput): UpdateUserByIdResponse
    ChangePassword(input: ChangePasswordInput): String
  }
`
