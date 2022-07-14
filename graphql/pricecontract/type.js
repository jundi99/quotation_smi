module.exports.PriceContract = `
  priceConNo: ID
  personNos: [String]
  isContract: Boolean
  priceType: String
  startAt: String
  endAt: String
  createdAt: String
  note: String
  fileXLS: String
`

module.exports = `
  type DetailContract {
    itemNo: String
    itemName: String
    unit: String
    qtyPack: Float
    sellPrice: Float
    moreQty: Int
    lessQty: Int
    equalQty: Int
  }

  type DetailCustomer {
    personNo: String
    customerName: String
  }

  type PriceContract {
    ${module.exports.PriceContract}
    details: [DetailContract]    
    customers: [DetailCustomer]
    total: Int
  }

  input GetPriceContractsInput {
    skip: Int
    limit: Int
  }

  type GetPriceContractsResponse {
    priceContracts: [PriceContract]
    total: Int
  }

  input idPriceContractInput {
    priceConNo: ID
    skip: Int
    limit: Int    
  }

  type Query {
    GetPriceContracts(input: GetPriceContractsInput): GetPriceContractsResponse
    GetPriceContract(input: idPriceContractInput): PriceContract
    GetPriceTypes: [String]
  }

  type DeletePriceContractResponse {
    nModified: Int
  }

  input DetailContractInput {
    itemNo: String
    itemName: String
    unit: String
    qtyPack: Float
    sellPrice: Float
    moreQty: Int
    lessQty: Int
    equalQty: Int
  }

  input UpsertPriceContractInput {
    ${module.exports.PriceContract}    
    details: [DetailContractInput]
  }

  type Mutation {
    UpsertPriceContract(input: UpsertPriceContractInput): PriceContract  
    DeletePriceContract(input: idPriceContractInput): DeletePriceContractResponse
  }
`
