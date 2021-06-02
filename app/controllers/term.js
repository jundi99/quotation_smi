const {
  SMIModels: { Term },
} = require('../daos')
const joi = require('joi')
const StandardError = require('../../utils/standard_error')
const _ = require('lodash')

joi.objectId = require('joi-objectid')(joi)

const GetTerms = async (query) => {
  const { skip, limit, q, type } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).default(0),
      limit: joi.number().min(1).default(25),
      type: joi.string(),
    })
    .validateAsync(query)

  const [terms, total] = await Promise.all([
    Term.find({
      name: new RegExp(q, 'gi'),
      ...(type ? { type } : {}),
    })
      .sort({ _id: 1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    Term.countDocuments(),
  ])

  return { terms, total }
}

const UpsertTerm = async (body) => {
  try {
    body = await joi
      .object({
        name: joi.string().required(),
        note: joi.string().optional(),
        type: joi.string(),
        isCreate: joi.boolean().default(true),
        _id: joi.objectId().optional(),
      })
      .validateAsync(body)
    const { name, type } = body
    const isExist = await Term.findOne({
      $and: [{ name }, { type }],
      ...(body.isCreate === false ? { _id: { $ne: body._id } } : {}),
    }) // don't lean this because used for save()

    if (isExist) {
      throw new StandardError('Data ini sudah ada')
    }

    let newData = {}

    if (!body.isCreate) {
      newData = await Term.findOne({ _id: body._id })
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
