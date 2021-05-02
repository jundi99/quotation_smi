module.exports.WarehouseConfig = `
  warehouseId: Int
  name: String
`

module.exports = `

  type WarehouseConfig {
    ${module.exports.WarehouseConfig}
  }

  type GetListWarehouseResponse {
    warehouses : [WarehouseConfig]
    message: String
  }

  type WarehouseConfigResponse {
    warehouses : [WarehouseConfig]
    updatedAt: String
  }

  type Query {
    GetWarehouseConfig: WarehouseConfigResponse    
    GetListWarehouse: GetListWarehouseResponse
  }

  input WarehouseConfigInput {
    ${module.exports.WarehouseConfig}
  }

  input UpdateConfigWarehouseInput {
    warehouses: [WarehouseConfigInput]
  }

  type Mutation {
    UpdateConfigWarehouse(input: UpdateConfigWarehouseInput): WarehouseConfigResponse
  }
`
