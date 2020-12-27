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
  term: Term
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

  type Term {
    termId: Int
    name: String
    note: String
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
    typeId: Int
    isActive: Boolean
  }

  input UpsertCustomerInput {
    personNo: String
    name: String
    note: String
    isTax: Boolean
    phone: String
    typeId: Int
    image: String
    salesman: Int
    isActive: Boolean
  }

  input PersonNoInput {
    personNo: String
  }

  type Query {
    GetCustomers(input: GetCustomersInput): GetCustomersResponse
    GetCustomer(input: PersonNoInput): Customer
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
