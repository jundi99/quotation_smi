const mongoose = require('mongoose')
const { Schema } = mongoose
const SchemaObject = new Schema(
  {
    id: String,
    icon: String,
    title: String,
    translate: String,
    type: String,
    url: String,
    children: { type: Array },
  },
  { timestamps: true },
)

SchemaObject.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

module.exports = {
  SchemaName: 'Menu',
  SchemaObject,
}
