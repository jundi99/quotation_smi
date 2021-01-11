const { SMIDBConn } = require('../init/mongodb')
const SMISchemas = require('dbmodels_quotation')

/**
 * model generator
 * @param {*} schemas from db models
 * @param {*} connection from init mongodb
 * @return {*} models
 */
const modelGenerator = (schemas, connection) => {
  const models = {}

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
}
