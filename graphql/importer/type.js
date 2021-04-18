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
    status: String
  }

  type Mutation {
    SyncUser: SyncResponse
    SyncItem(cache: Boolean): SyncItemResponse
    SyncItemCategory: SyncResponse
    SyncCustomer: SyncResponse
    SyncSalesman: SyncResponse
    SyncTerm: SyncResponse
  }
`
