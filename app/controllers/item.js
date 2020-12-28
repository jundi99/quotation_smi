const {
  SMIModels: { ItemCategory },
} = require('../daos')
const joi = require('joi')

const GetItemCategories = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)

  const itemCategories = await ItemCategory.find({
    $or: [{ name: new RegExp(q, 'gi') }],
  })
    .sort({ _id: -1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return itemCategories
}

module.exports = {
  GetItemCategories,
}
