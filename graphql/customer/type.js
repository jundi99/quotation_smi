module.exports.Customer = `
  customerId: Int
  personNo: String
  name: String
  category: CustCategory
  address: Address
  contact: String
  phone: String
  email: String
  creditLimit: Float
  note: String
  outstandingAR: Float
  salesman: Salesman
  isActive: Boolean
  image: String
  isTax: Boolean
`

module.exports = `
  type Customer {
    ${module.exports.Customer}
  }

  type CustCategory {
    _id: ID
    name: String
  }

  type Address {
    addressLine1: String
    addressLine2: String
    city: String
    stateProve: String
    zipCode: String
    country: String
  }

  type GetCustomersResponse {
    customers: [Customer]
    total: Int
  }

  input GetCustomersInput {
    skip: Int
    limit: Int
    personNo: String
    name: String
    idType: String
    isActive: Boolean
  }

  input UpsertCustomerInput {
    personNo: String
    name: String
    note: String
    isTax: Boolean
    phone: String
    idType: String
    image: String
    salesman: Int
    isActive: Boolean
    email: String
    authorize: AuthorizeUserInput
    isCreate: Boolean
    password: String
  }

  input PersonNoInput {
    personNo: String
  }

  input GetLimitCustomerInput {
    personNo: String!
  }

  type GetLimitCustomerResponse {
    outstandingInv: Float
    creditLimit: Float
    restLimit: Float
    message: String
  }

  type Query {
    GetCustomers(input: GetCustomersInput): GetCustomersResponse
    GetCustomer(input: PersonNoInput): Customer
    GetCustCategories: [CustCategory]
    GetLimitCustomer(input: GetLimitCustomerInput): GetLimitCustomerResponse
  }

  type DeleteCustomerResponse {
    nModified: Int
  }

  input UpsertCustCategoryInput {
    name: String
  }

  type Mutation {
    UpsertCustomer(input: UpsertCustomerInput): Customer  
    DeleteCustomer(input: PersonNoInput): DeleteCustomerResponse
    UpsertCustCategory(input: UpsertCustCategoryInput): CustCategory
  }
`
