/* eslint-disable max-lines-per-function */

const {
  SMIModels: { Salesman },
} = require('../daos')
const joi = require('joi')
const StandardError = require('../../utils/standard_error')
const { log } = console

const UpdateSalesman = async (body) => {
  try {
    body = await joi
      .object({
        _id: joi.objectId().required(),
        emailCC: joi.string().required(),
      })
      .validateAsync(body)
    const { _id, emailCC } = body
    const salesmanData = await Salesman.findOne({
      _id,
    }).lean()

    let result

    if (salesmanData) {
      result = await Salesman.findByIdAndUpdate(
        { _id },
        { emailCC },
        { new: true },
      ).lean()
    } else {
      throw new StandardError('Salesman tidak terdaftar')
    }

    return result
  } catch (error) {
    log('UpdateSalesman:', error)
    if (error.message) {
      throw new StandardError(`Gagal menyimpan data salesman, ${error.message}`)
    } else {
      throw new StandardError('Gagal menyimpan data salesman')
    }
  }
}

const GetSalesmen = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).default(0),
      limit: joi.number().min(1).default(25),
    })
    .validateAsync(query)

  const [salesmen, total] = await Promise.all([
    Salesman.find({
      $or: [
        { lastName: new RegExp(q, 'gi') },
        { firstName: new RegExp(q, 'gi') },
      ],
    })
      .sort({ salesmanId: 1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    Salesman.countDocuments(),
  ])

  return { salesmen, total }
}

module.exports = {
  UpdateSalesman,
  GetSalesmen,
}
