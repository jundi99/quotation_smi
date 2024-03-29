module.exports = `
  input UpdateSOInput {
    quoNo: String
    attachmentPO: String
    isConfirm: Boolean
  }

  type Query {
    GenerateCreditLimitPassword: String
  }

  input ValidatePassCreditInput {
    quoNo: String
    password: String
  }
  type Mutation {
    UpdateSO(input: UpdateSOInput): Quotation  
    ValidatePasswordCredit(input: ValidatePassCreditInput): String
  }
`
