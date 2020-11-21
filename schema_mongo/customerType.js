const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    typeId: Number,
    name: { type: String, required: true },
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'CustomerType',
  SchemaObject,
}