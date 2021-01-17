module.exports.PriceContract = `
  _id: ID
  customerNames: [String]
  contractPrice: Boolean
  priceType: String
  startAt: String
  endAt: String
  note: String
  fileXLS: String
`

module.exports = `
  type DetailContract {
    item: ID
    qtyPack: Int
    sellPrice: Float
    moreQty: Int
    lessQty: Int
    equalQty: Int
  }

  type PriceContract {
    ${module.exports.PriceContract}
    detail: [DetailContract]    
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
    _id: ID
  }

  type GetPriceTypesResponse {
    data: [String]
    message: String
  }

  type Query {
    GetPriceContracts(input: GetPriceContractsInput): GetPriceContractsResponse
    GetPriceContract(input: idPriceContractInput): PriceContract
    GetPriceTypes: GetPriceTypesResponse
  }

  type DeletePriceContractResponse {
    nModified: Int
  }

  input DetailContractInput {
    item: ID
    qtyPack: Int
    sellPrice: Float
    moreQty: Int
    lessQty: Int
    equalQty: Int
  }

  input UpsertPriceContractInput {
    ${module.exports.PriceContract}    
    detail: [DetailContractInput]
  }

  type Mutation {
    UpsertPriceContract(input: UpsertPriceContractInput): PriceContract  
    DeletePriceContract(input: idPriceContractInput): DeletePriceContractResponse
  }
`
