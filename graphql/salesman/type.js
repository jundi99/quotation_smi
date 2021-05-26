module.exports.Salesman = `
  _id: ID
  salesmanId: Int
  firstName: String
  lastName: String
`

module.exports = `
  type Salesman {
    ${module.exports.Salesman}
  }
`
