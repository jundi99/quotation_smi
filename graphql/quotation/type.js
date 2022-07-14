module.exports.Quotation = `
  _id: ID
  personNo: String
  quoNo: String
  quoDate: String
  deliveryDate: String
  payment: String
  delivery: String
  deliveryCost: Int
  detail: [DetailQuotation]
  subTotal: Float
  totalOrder: Float
  ppn: Float
  note: String
  attachmentPO: String
  isConfirm: Boolean
  status: String
  deliveryStatus: String
  salesman: Salesman
  reference: String
  validity: String
`

module.exports = `
  type DetailQuotation {
    itemNo: String
    itemName: String
    qtyPack: Float
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
    customerEmail: String    
  }
  
  type GetQuotationsResponse {
    quotations: [QuoList]
    total: Int
  }

  enum StatusQuoSO {
    Queue
    Processed
    Sent
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
    personNo: String
    salesman: ID
  }

  input DetailQuotationInput {
    itemNo: String
    itemName: String
    qtyPack: Float
    quantity: Int
    price: Float
    amount: Float
    status: String
    unit: String
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
    ppn: Float
    note: String
    status: StatusQuoSO
    deliveryStatus: String
    salesman: ID
    reference: String
    validity: String
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
    GetQuotation(input: QuoIdInput): QuoList
  }

  type DeleteQuotationResponse {
    nModified: Int
  }

  type Mutation {
    UpsertQuotation(input: UpsertQuotationInput): Quotation  
    DeleteQuotation(input: QuoIdInput): DeleteQuotationResponse
    BuyItemQuoAgain(quoNo: String): [ItemQuo]
  }
`
