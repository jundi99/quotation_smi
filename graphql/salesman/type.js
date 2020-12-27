module.exports.Salesman = `
  salesmanId: Int
  firstName: String
  lastName: String
`

module.exports = `
  type Salesman {
    ${module.exports.Salesman}
  }
`
