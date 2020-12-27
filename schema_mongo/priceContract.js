const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    customerNames: [String],
    contractPrice: Boolean,
    typePrice: String,
    startAt: Date,
    endAt: Date,
    note: String,
    fileXLS: String,
    detail: [
      {
        item: { type: Schema.Types.ObjectId, ref: 'Item' },
        qtyPack: Number,
        sellPrice: Number,
        moreQty: Number,
        lessQty: Number,
        equalQty: Number,
      },
    ],
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'PriceContract',
  SchemaObject,
}
