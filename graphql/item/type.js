module.exports.Item = `
  itemNo: String
  name: String
  unit: String
  reserved: ItemReserved
  price: PriceLevel
  quantity: Int
  category: ItemCategory
  note: String
  weight: Int
  dimension: Dimension
  stockSMI: Float
  stockSupplier: Float
`
module.exports = `
  type ItemReserved {
    item1: String
    item2: String
    item3: String
    item4: String
    item5: String
    item6: String
    item7: String
    item8: String
    item9: String
    item10: String                        
  }

  type PriceLevel {
    level1: Int
    level2: Int
    level3: Int
    level4: Int
    level5: Int
  }

  type ItemCategory {
    _id: ID
    name: String
  }

  type Dimension {
    width: Int
    height: Int
    depth: Int
  }

  type Item {
    ${module.exports.Item}
    outstandingOrder: Float
    totalStockReadySell: Float
    qtyPack: String
  }

  type GetItemsResponse {
    items: [Item]
    differentData: Int
    message: String
    total: Int
  }
  
  input GetItemsInput {
    category: ID
    itemNo: String
    name: String
    priceType: String
    skip: Int
    limit: Int
  }

  input GetItemCategoriesInput {
    q: String
    skip: Int
    limit: Int
  }

  type priceContractDetail {
    qtyPack: Float
    lessQty: Float
    moreQty: Float
    equalQty: Float
    sellPrice: Float
  }

  type ItemQuo {
    itemNo: String
    name: String
    availableStock: String
    price: Float
    qtyPack: Float
    priceContracts: [priceContractDetail]
    unit: String
    quantity: Float
    status: String
  }

  input GetItemsQuoInput {
    itemNo: String
    personNo: String
    name: String
    skip: Int
    limit: Int
  }
  
  input StatusItem {
    itemNo: String
    quantity: Int    
  }

  input GetStatusItemInput {
    details: [StatusItem]
  }

  type StatusItemsResponse {
    itemNo: String
    status: String
  }
  type Query {
    GetItems(input: GetItemsInput): GetItemsResponse
    GetItemCategories(input: GetItemCategoriesInput): [ItemCategory]
    GetItemsQuo(input: GetItemsQuoInput): [ItemQuo]
    GetStatusItem(input: GetStatusItemInput): [StatusItemsResponse]
  }
`
