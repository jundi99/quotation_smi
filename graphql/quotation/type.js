module.exports.Quotation = `
  _id: ID
  personNo: Int
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
  isConfirm: Boolean
  status: String
  deliveryStatus: String
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

  type QuoList {
    ${module.exports.Quotation}    
    customerName: String    
  }
  type GetQuotationsResponse {
    quotations: [QuoList]
    total: Int
  }

  enum StatusQuoSO {
    Queue
    Processed
    Delivered
    Closed
  }

  input GetQuotationsInput {
    skip: Int
    limit: Int
    itemNo: String
    itemName: String
    dateFrom: String
    dateTo: String
    status: StatusQuoSO
    personNo: Int
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
    personNo: String
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
    status: StatusQuoSO
    deliveryStatus: String
  }

  input QuoIdInput {
    quoNo: String
  }

  type GetDeliveryCostResponse {
    name: String
    cost: Int
  }

  type Query {
    GetQuotations(input: GetQuotationsInput): GetQuotationsResponse
    GetQuotation(input: QuoIdInput): Quotation
    GetDeliveryOption: [GetDeliveryCostResponse]
  }

  type DeleteQuotationResponse {
    nModified: Int
  }

  type Mutation {
    UpsertQuotation(input: UpsertQuotationInput): Quotation  
    DeleteQuotation(input: QuoIdInput): DeleteQuotationResponse
  }
`
