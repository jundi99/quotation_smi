module.exports.Quotation = `
  _id: ID
  customerId: Int
  quoNo: String
  quoDate: String
  deliveryDate: String
  payment: String
  delivery: String
  deliveryCost: Int
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
    dateFrom: String
    dateTo: String
    statusQuo: String
    statusSO: String
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
    customerId: Int
    quoNo: String
    quoDate: String
    deliveryDate: String
    payment: String
    delivery: String
    deliveryCost: Int
    detail: [DetailQuotationInput]
    subTotal: Float
    totalOrder: Float
    note: String
  }

  input QuoIdInput {
    _id: ID
  }

  type DeliveryCost {
    name: String
    cost: Int
  }

  type Query {
    GetQuotations(input: GetQuotationsInput): GetQuotationsResponse
    GetQuotation(input: QuoIdInput): Quotation
    GetDeliveryOption: [DeliveryCost]
  }

  type DeleteQuotationResponse {
    nModified: Int
  }

  type Mutation {
    UpsertQuotation(input: UpsertQuotationInput): Quotation  
    DeleteQuotation(input: QuoIdInput): DeleteQuotationResponse
  }
`
