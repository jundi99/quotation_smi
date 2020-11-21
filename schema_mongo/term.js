const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    termId: Number,
    name: String,
    note: String,
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-deep-populate')(mongoose))
SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'Term',
  SchemaObject,
}