const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    categoryId: Number,
    name: String,
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'ItemCategory',
  SchemaObject,
}
