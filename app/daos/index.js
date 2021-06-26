const { SMIDBConn, SMIDBConn2 } = require('../init/mongodb')
const SMISchemas = require('../../dbmodels_quotation')

/**
 * model generator
 * @param {*} schemas from db models
 * @param {*} connection from init mongodb
 * @param {*} conn flag for connection mongodb*
 * @return {*} models
 */
const modelGenerator = (schemas, connection, conn) => {
  const models = {}

  if (conn === 2) {
    schemas = schemas.filter((schema) =>
      ['Item', 'Customer'].includes(schema.SchemaName),
    )
  }
  schemas.forEach((schema) => {
    models[schema.SchemaName] = connection.model(
      schema.SchemaName,
      schema.SchemaObject,
    )
  })

  return models
}

module.exports = {
  SMIModels: modelGenerator(SMISchemas, SMIDBConn),
  SMIModels2: modelGenerator(SMISchemas, SMIDBConn2, 2),
}
