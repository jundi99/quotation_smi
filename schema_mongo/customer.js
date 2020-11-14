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
      contry: String,
    },
    contact: String,
    phone: String,
    email: String,
    creditLimit: Number,
    note: String,
    outstandingAR: Number,
    priceType: [Schema.Types.Mixed],
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
