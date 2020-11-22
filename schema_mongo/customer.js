const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    customerId: Number,
    personNo: String,
    name: String,
    typeId: { type: Schema.Types.ObjectId, ref: 'CustomerType' },
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      stateProve: String,
      zipCode: String,
      country: String,
    },
    contact: String,
    phone: String,
    email: String,
    creditLimit: Number,
    note: String,
    outstandingAR: Number,
    priceType: [Schema.Types.Mixed],
    salesman: { type: Schema.Types.ObjectId, ref: 'Salesman' },
    term: { type: Schema.Types.ObjectId, ref: 'Term' },
    isActive: { type: Boolean, default: false },
    image: String,
    isTax: { type: Boolean, default: false },
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'Customer',
  SchemaObject,
}
