const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    quoNo: String,
    quoDate: Date,
    deliveryDate: Date,
    payment: String,
    delivery: String,
    detail: [
      {
        itemNo: String,
        itemName: String,
        qtyPack: Number,
        quantity: Number,
        Price: Number,
        amount: Number,
        status: String,
      },
    ],
    subTotal: Number,
    totalOrder: Number,
    note: String,
    attachmentPO: String,
    confirmQuotation: Boolean,
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'Quotation',
  SchemaObject,
}
