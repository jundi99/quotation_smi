const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    itemNo: String,
    name: String,
    unit: String,
    reserved: {
      item1: String,
      item2: String,
      item3: String,
      item4: String,
      item5: String,
      item6: String,
      item7: String,
      item8: String,
      item9: String,
      item10: String,
    },
    minimumOrder: [Schema.Types.Mixed],
    price: {
      level1: Number,
      level2: Number,
      level3: Number,
      level4: Number,
      level5: Number,
    },
    quantity: Number,
    category: { type: Schema.Types.ObjectId, ref: 'ItemCategory' },
    note: String,
    weigth: Number,
    dimension: {
      width: Number,
      height: Number,
      depth: Number,
    },
    stockSMI: Number,
    stockSupplier: Number,
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'Item',
  SchemaObject,
}
