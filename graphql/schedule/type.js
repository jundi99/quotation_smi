module.exports = `
  type Query {
    current: User
  }

  type UpdateScheduleStockResponse {
    message: String
  }

  type Mutation {
    UpdateScheduleStock(minutes:Int!): UpdateScheduleStockResponse
  }
`
