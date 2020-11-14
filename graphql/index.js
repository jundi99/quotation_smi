const {
  makeExecutableSchema,
  loadFilesSync,
  mergeTypeDefs,
  mergeResolvers,
} = require('graphql-tools')
const path = require('path')

const typesArray = loadFilesSync(path.join(__dirname, '**/type.js'))
const typeDefs = mergeTypeDefs(typesArray, { all: true })

const resolversArray = loadFilesSync(path.join(__dirname, '**/resolver.js'))
const resolvers = mergeResolvers(
  resolversArray.map((key) => {
    if (key.constructor === Function) {
      key = key()
    }

    return key
  }),
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

module.exports = schema
