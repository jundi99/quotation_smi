module.exports.Quotation = `
  customer: ID
  quoNo: String
  quoDate: String
  deliveryDate: String
  payment: String
  delivery: String
  detail: [DetailQuotation]
  subTotal: Float
  totalOrder: Float
  note: String
  attachmentPO: String
  confirmQuotation: Boolean
`

module.exports = `
  type DetailQuotation {
    itemNo: String
    itemName: String
    qtyPack: Int
    quantity: Int
    price: Float
    amount: Float
    status: String
  }

  type Quotation {
    ${module.exports.Quotation}
  }

  type GetQuotationsResponse {
    quotations: [Quotation]
    total: Int
  }

  input GetQuotationsInput {
    skip: Int
    limit: Int
    itemNo: String
    itemName: String
  }

  input DetailQuotationInput {
    itemNo: String
    itemName: String
    qtyPack: Int
    quantity: Int
    price: Float
    amount: Float
    status: String
  }

  input UpsertQuotationInput {
    customer: ID
    quoNo: String
    quoDate: String
    deliveryDate: String
    payment: String
    delivery: String
    detail: [DetailQuotationInput]
  }

  input QuoIdInput {
    _id: ID
  }

  type Query {
    GetQuotations(input: GetQuotationsInput): GetQuotationsResponse
    GetQuotation(input: QuoIdInput): Quotation
  }

  type DeleteQuotationResponse {
    nModified: Int
  }

  type Mutation {
    UpsertQuotation(input: UpsertQuotationInput): Quotation  
    DeleteQuotation(input: QuoIdInput): DeleteQuotationResponse
  }
`
