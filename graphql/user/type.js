module.exports = `
  type Query {
    current: User
  }

  type loginResponse {
    token: String
    current: User
  }

  type Mutation {
    #register(login: String!, password: String!): String
    login(login: String!, password: String!): loginResponse
  }
`
