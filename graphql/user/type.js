module.exports = `
  type SubMenu {
    icon: String
    id: String
    title: String
    translate: String
    type: String
    url: String
  }

  type MenuResponse {
    title: String
    translate: String
    type: String
    children : [SubMenu]
  }

  type Query {
    CurrentUserMenu: [MenuResponse]
  }

  type LoginResponse {
    token: String
    current: User
  }

  type Mutation {
    #register(login: String!, password: String!): String
    Login(login: String!, password: String!): LoginResponse
  }
`
