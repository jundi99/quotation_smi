const {
  SMIModels: { Customer, CustCategory, Salesman, Term },
} = require('../daos')
const joi = require('joi')

const GetCustomers = async (query) => {
  const { skip, limit, name, personNo, typeId, isActive } = await joi
    .object({
      personNo: joi.string().optional(),
      name: joi.string().optional(),
      typeId: joi.number().optional(),
      isActive: joi.boolean().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const [customers, total] = await Promise.all([
    Customer.find({
      ...(personNo ? { personNo: new RegExp(personNo, 'gi') } : {}),
      ...(name ? { name: new RegExp(name, 'gi') } : {}),
      ...(typeId ? { typeId } : {}),
      ...(isActive ? { isActive } : {}),
    })
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .deepPopulate(['typeId', 'salesman', 'term'])
      .lean(),
    Customer.countDocuments(),
  ])

  return { customers, total }
}

const UpsertCustomer = async (body) => {
  body = await joi
    .object({
      personNo: joi.string().required(),
      name: joi.string().required(),
      note: joi.string().optional(),
      isTax: joi.boolean().default(false),
      phone: joi.string().optional(),
      typeId: joi.number().optional(),
      image: joi.string().optional(),
      salesman: joi.number().optional(),
      isActive: joi.boolean().default(false),
    })
    .validateAsync(body)
  const newData = await Customer.findOneAndUpdate(
    { personNo: body.personNo },
    body,
    { new: true, upsert: true },
  ).lean()

  return newData
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
  const customer = await Customer.findOne({ personNo }).lean()

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
    .sort({ _id: -1 })
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
    .sort({ _id: -1 })
    .skip(skip * limit)
    .limit(limit)
    .lean()

  return terms
}

module.exports = {
  GetCustomers,
  GetCustomer,
  UpsertCustomer,
  DeleteCustomer,
  UpsertCustCategory,
  GetSalesmen,
  GetTerms,
}
