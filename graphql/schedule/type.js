module.exports = `
  type UpdateScheduleStockResponse {
    message: String
  }

  input UpdateScheduleStockInput {
    minutes: Int!
    dbFina: String
    fileXLS: String
  }

  type GetScheduleResponse {
    minutes: Int
    dbFina: String
    fileXLS: String
  }
  type Query {
    GetSchedule: GetScheduleResponse
  }

  type Mutation {
    UpdateScheduleStock(input: UpdateScheduleStockInput): UpdateScheduleStockResponse
  }
`
