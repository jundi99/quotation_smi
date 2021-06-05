module.exports = `
  type SyncResponse {
    total: Int
    newData: Int
    message: String
  }

  type SyncProgressResponse {
    total: Int
    newData: Int
    updateData: Int
    status: String
    progress: Float
  }

  type Mutation {
    SyncUser: SyncResponse
    SyncItem(cache: Boolean): SyncProgressResponse
    SyncItemCategory: SyncResponse
    SyncCustomer(cache: Boolean): SyncProgressResponse
    SyncSalesman: SyncResponse
  }
`
