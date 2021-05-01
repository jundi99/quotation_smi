module.exports.Term = `
  name: String
  type: TermType
  note: String
`

module.exports = `
  enum TermType {
    Reference
    Payment
    Delivery
    Validity
  }

  type Term {
    ${module.exports.Term}
  }

  input TermInput {
    ${module.exports.Term}    
  }

  type Query {
    GetTerms(input: GetMasterInput): [Term]    
  }

  type Mutation {
    UpsertTerm(input: TermInput): Term
  }
`
