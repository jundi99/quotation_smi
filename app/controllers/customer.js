const {
  SMIModels: { Customer, CustCategory, Salesman, Term },
} = require('../daos')
const joi = require('joi')
const _ = require('lodash')
const StandardError = require('../../utils/standard_error')
const { isUndefined } = require('lodash')
const { log } = console
const GetCustomers = async (query) => {
  const { skip, limit, name, personNo, idType, isActive } = await joi
    .object({
      personNo: joi.string().optional(),
      name: joi.string().optional(),
      idType: joi.string().optional(),
      isActive: joi.boolean().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const filterQuery = {
    ...(personNo ? { personNo: new RegExp(personNo, 'gi') } : {}),
    ...(name ? { name: new RegExp(name, 'gi') } : {}),
    ...(idType ? { category: idType } : {}),
    ...(!isUndefined(isActive) ? { isActive } : {}),
  }
  const [customers, total] = await Promise.all([
    Customer.find(filterQuery)
      .sort({ personNo: -1 })
      .skip(skip * limit)
      .limit(limit)
      .deepPopulate(['category', 'salesman', 'term'])
      .lean(),
    Customer.countDocuments(filterQuery),
  ])

  return { customers, total }
}

const UpsertCustomer = async (body) => {
  try {
    if (body.authorize) {
      body = await joi
        .object({
          personNo: joi.string().required(),
          authorize: joi.object().optional(),
        })
        .validateAsync(body)
    } else {
      body = await joi
        .object({
          personNo: joi.string().required(),
          name: joi.string().required(),
          note: joi.string().optional(),
          isTax: joi.boolean().default(false),
          phone: joi.string().optional(),
          idType: joi.string().optional(),
          image: joi.string().optional().allow('', null),
          salesman: joi.number().optional(),
          isActive: joi.boolean().default(false),
          email: joi.string().required(),
          isCreate: joi.boolean().optional(),
        })
        .validateAsync(body)
    }

    const { email, name } = body
    const userName = email ? email : name

    body.profile = {
      fullName: userName,
    }

    body.userName = userName
    body.encryptedPassword = userName
    body.category = body.idType
    const salesmanData = await Salesman.findOne({
      salesmanId: body.salesman,
    }).lean()

    body.salesman = salesmanData ? salesmanData._id : null
    let newData = await Customer.findOne({
      $or: [{ personNo: body.personNo }, { email }],
    }) // don't lean this because used for save()

    if (newData) {
      if (body.isCreate) {
        throw new StandardError('PersonNo / Email sudah ada')
      }
      newData = _.merge(newData, body)
      newData.save()
    } else {
      const CRUD = {
        create: true,
        edit: true,
        delete: true,
        print: true,
        view: true,
      }

      body.authorize = {
        quotation: { name: 'Quotation', ...CRUD },
        // salesOrder: { name: 'Sales Order', ...CRUD },
      }
      newData = await new Customer(body).save()
    }

    return newData
  } catch (error) {
    log('UpsertCustomer:', error)
    if (error.message) {
      throw new StandardError(`Gagal menyimpan data customer, ${error.message}`)
    } else {
      throw new StandardError('Gagal menyimpan data customer')
    }
  }
}

const DeleteCustomer = async (body) => {
  const { personNo } = await joi
    .object({
      personNo: joi.string().required(),
    })
    .validateAsync(body)
  const dataDeleted = await Customer.delete({ personNo })

  return dataDeleted
}

const GetCustomer = async (body) => {
  const { personNo } = await joi
    .object({
      personNo: joi.string().required(),
    })
    .validateAsync(body)
  const customer = await Customer.findOne({ personNo })
    .deepPopulate(['category', 'salesman', 'term'])
    .lean()

  return customer
}

const UpsertCustCategory = async (body) => {
  body = await joi
    .object({
      name: joi.string().required(),
    })
    .validateAsync(body)
  const newData = await CustCategory.findOneAndUpdate(
    { name: body.name },
    body,
    { new: true, upsert: true },
  ).lean()

  return newData
}

const GetSalesmen = async (query) => {
  const { skip, limit, q } = await joi
    .object({
      q: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)

  const salesmen = await Salesman.find({
    $or: [
      { lastName: new RegExp(q, 'gi') },
      { firstName: new RegExp(q, 'gi') },
    ],
  })
    .sort({ salesmanId: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return salesmen
}

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
    .sort({ termId: 1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return terms
}

const GetCustCategories = () => CustCategory.find({}).lean()

module.exports = {
  GetCustomers,
  GetCustomer,
  UpsertCustomer,
  DeleteCustomer,
  UpsertCustCategory,
  GetSalesmen,
  GetTerms,
  GetCustCategories,
}
