module.exports = `
  type SyncResponse {
    total: Int
    newData: Int
    message: String
  }

  type SyncItemResponse {
    total: Int
    newData: Int
    newUpdateStock: Int
    message: String
  }

  type Mutation {
    SyncUser: SyncResponse
    SyncItem: SyncItemResponse
    SyncItemCategory: SyncResponse
    SyncCustomer: SyncResponse
    SyncCustType: SyncResponse
    SyncSalesman: SyncResponse
    SyncTerm: SyncResponse
  }
`
