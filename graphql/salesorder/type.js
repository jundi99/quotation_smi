module.exports = `
  input UpdateSOInput {
    customerId: Int
    quoNo: String
    attachmentPO: String
    isConfirm: Boolean
  }

  type Mutation {
    UpdateSO(input: UpdateSOInput): Quotation  
  }
`
