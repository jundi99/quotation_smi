const {
  SMIModels: { WarehouseConfig },
} = require('../daos')
const joi = require('joi')
// const StandardError = require('../../utils/standard_error')

const UpdateConfigWarehouse = async (body) => {
  const { warehouses } = await joi
    .object({
      warehouses: joi.array().items(joi.object()),
    })
    .validateAsync(body)
  const result = await WarehouseConfig.findOneAndUpdate(
    {},
    { warehouses },
    { new: true, upsert: true },
  ).lean()

  result.updatedAt = result.updatedAt.toLocaleString()

  return result
}

const GetWarehouseConfig = async () => {
  const result = await WarehouseConfig.findOne().lean()

  if (!result) {
    return { warehouses: [], updatedAt: null }
  }

  result.updatedAt = result.updatedAt.toLocaleString()

  return result
}

const GetStockWarehouses = async () => {
  const whConfig = await WarehouseConfig.findOne().lean()

  return whConfig.warehouses.map((wh) => wh.warehouseId).join()
}

module.exports = {
  UpdateConfigWarehouse,
  GetWarehouseConfig,
  GetStockWarehouses,
}
