module.exports.Term = `
  _id: ID
  name: String
  type: TermType
  note: String
  isCreate: Boolean
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

  input GetTermsInput {
    q: String
    skip: Int
    limit: Int
    type: TermType
  } 

  type DeleteTermResponse {
    nModified: Int
  }

  type Query {
    GetTerms(input: GetTermsInput): [Term]    
  }

  type Mutation {
    UpsertTerm(input: TermInput): Term
    DeleteTerm(_id: ID): DeleteTermResponse
  }
`
