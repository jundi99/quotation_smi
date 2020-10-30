const { SMIDBConn } = require('../init/mongodb')
const SMISchemas = require('../../schema_mongo')

/**
 * model generator
 * @param {*} schemas from db models
 * @param {*} connection from init mongodb
 * @returns {*} models
 */
const modelGenerator = (schemas, connection) => {
  const models = {}

  schemas.forEach((schema) => {
    models[schema.SchemaName] = connection.model(
      schema.SchemaName,
      schema.SchemaObject
    )
  })

  return models
}

module.exports = {
  SMIModels: modelGenerator(SMISchemas, SMIDBConn),
}
