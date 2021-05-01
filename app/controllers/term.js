const {
  SMIModels: { Term },
} = require('../daos')
const joi = require('joi')

const GetTerms = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)

  const terms = await Term.find({
    $or: [{ name: new RegExp(q, 'gi') }],
  })
    .sort({ _id: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return terms
}

const UpsertTerm = async (body) => {
  try {
    const { name, type } = await joi
      .object({
        name: joi.string().required(),
        note: joi.string().optional(),
        type: joi.string().allow(['Reference', 'Payment', 'Delivery', 'Validity']),
        isCreate: joi.boolean().optional().default(true),
      })
      .validateAsync(body)

    let newData = await Term.findOne({
      $and: [{ name }, { type }]
    }) // don't lean this because used for save()

    if (newData) {
      if (body.isCreate) {
        throw new StandardError('Data ini sudah ada')
      }
      newData = _.merge(newData, body)
      newData.save()
    } else {
      newData = await new Term(body).save()
    }

    return newData
  } catch (error) {
    log('UpsertCustomer:', error)
    if (error.message) {
      throw new StandardError(`Gagal menyimpan data term, ${error.message}`)
    } else {
      throw new StandardError('Gagal menyimpan data term')
    }
  }
}

module.exports = {
  GetTerms,
  UpsertTerm
}