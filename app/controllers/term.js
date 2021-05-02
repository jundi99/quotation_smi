const {
  SMIModels: { Term },
} = require('../daos')
const joi = require('joi')
const StandardError = require('../../utils/standard_error')
const _ = require('lodash')

const GetTerms = async (query) => {
  const { skip, limit, q, type } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
      type: joi.string(),
    })
    .validateAsync(query)

  const terms = await Term.find({
    name: new RegExp(q, 'gi'),
    ...(type ? { type } : {}),
  })
    .sort({ _id: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return terms
}

const UpsertTerm = async (body) => {
  try {
    body = await joi
      .object({
        name: joi.string().required(),
        note: joi.string().optional(),
        type: joi.string(),
        isCreate: joi.boolean().default(true),
      })
      .validateAsync(body)
    const { name, type } = body
    let newData = await Term.findOne({
      $and: [{ name }, { type }],
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
    if (error.message) {
      throw new StandardError(`Gagal menyimpan data term, ${error.message}`)
    } else {
      throw new StandardError('Gagal menyimpan data term')
    }
  }
}

const DeleteTerm = (_id) => {
  try {
    return Term.delete(_id)
  } catch (error) {
    throw new StandardError(`Gagal menghapus data term, ${error.message}`)
  }
}

module.exports = {
  GetTerms,
  UpsertTerm,
  DeleteTerm,
}
