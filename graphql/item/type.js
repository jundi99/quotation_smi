module.exports.Item = `
  itemNo: String
  name: String
  unit: String
  reserved: ItemReserved
  minimumOrder: String
  price: PriceLevel
  quantity: Int
  category: Category
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

  type Category {
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
  }

  type GetItemResponse {
    items: [Item]
    differentData: Int
  }
  
  input GetItemInput {
    category: ID
    itemNo: String
    name: String
    priceType: String
    skip: Int
    limit: Int
  }

  type Query {
    GetItem(input: GetItemInput): GetItemResponse
  }
`