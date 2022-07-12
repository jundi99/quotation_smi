module.exports.Salesman = `
  _id: ID
  salesmanId: Int
  firstName: String
  lastName: String
  emailCC: String
`

module.exports = `
  type Salesman {
    ${module.exports.Salesman}
  }

  input GetMasterInput {
    q: String
    skip: Int
    limit: Int
  }  

  type GetSalesmenResponse {
    salesmen: [Salesman]
    total: Int
  }  

  type Query {
    GetSalesmen(input: GetMasterInput): GetSalesmenResponse  
  }

  input UpdateSalesmanInput {
    _id: ID
    emailCC: String
  }

  type Mutation {
    UpdateSalesman(input: UpdateSalesmanInput): Salesman 
  }  
`
