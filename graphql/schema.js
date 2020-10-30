const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type User {
    _id: String!
    userName: String!
  }

  type Query {
    current: User
  }

  type Mutation {
    register(login: String!, password: String!): String
    login(login: String!, password: String!): String
  }
`

module.exports = typeDefs
