const {
  SMIModels: { Quotation, Customer },
} = require('../daos')
const joi = require('joi')
const { USR_EMAIL, PASS_EMAIL } = process.env
const { log } = console

joi.objectId = require('joi-objectid')(joi)
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: USR_EMAIL,
    pass: PASS_EMAIL,
  },
})

const GetQuotations = async (query) => {
  const { skip, limit, itemNo, itemName, dateFrom, dateTo, status } = await joi
    .object({
      itemNo: joi.string().optional(),
      itemName: joi.string().optional(),
      dateFrom: joi.string().optional(),
      dateTo: joi.string().optional(),
      status: joi.date().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
    })
    .validateAsync(query)
  const [quotations, total] = await Promise.all([
    Quotation.find({
      ...(dateFrom && dateTo
        ? { createdAt: { $gte: dateFrom, $lte: dateTo } }
        : {}),
      ...(status ? { status } : {}),
      ...(itemNo ? { itemNo: new RegExp(itemNo, 'gi') } : {}),
      ...(itemName ? { itemName: new RegExp(itemName, 'gi') } : {}),
    })
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    Quotation.countDocuments(),
  ])

  return { quotations, total }
}

const SendRecapEmailQuo = (customer, newValue) => {
  let message =
    `<html>
      <head>
        <style> table, th, td { border: 1px solid black; border-collapse: collapse; }
        </style>
      </head>
      <body>` +
    // '<table style="border: none; cellspacing:0 cellpadding:0">' +
    // '<table>' +
    // '<tr>' +
    // '<td>Nama Customer:</td>' +
    // `<td>${customer.name}</td>` +
    // `</tr>` +
    // `<tr>` +
    // `<td>No Quotation:</td>` +
    // `<td>${newValue.quoNo}</td>` +
    // `</tr>` +
    // `</table>` +
    `Berikut detail quotation anda: <br>` +
    `Nama Customer: ${customer.name}<br>` +
    `No Quotation: ${newValue.quoNo}<br>` +
    `Tanggal Quotation: ${newValue.createdAt.toLocaleString()}<br>` +
    `Pembayaran: ${newValue.payment}<br>` +
    `Pengiriman: ${newValue.delivery}<br>` +
    `Tanggal Pengiriman: ${newValue.deliveryDate.toLocaleString()}<br>` +
    `Note: ${newValue.note ? newValue.note : '-'} <br><br>` +
    `<table style="width: 100%">` +
    `<thead>` +
    `<th>Kode Barang</th>` +
    `<th>Nama Barang</th>` +
    `<th>Qty/Pack</th>` +
    `<th>Quantity</th>` +
    `<th>Status</th>` +
    `</thead>`

  for (const {
    itemNo,
    itemName,
    qtyPack,
    quantity,
    status,
  } of newValue.detail) {
    message +=
      `<tr><td>${itemNo}</td>` +
      `<td>${itemName}</td>` +
      `<td>${qtyPack}</td>` +
      `<td>${quantity}</td>` +
      `<td>${status}</td>` +
      `</tr>`
  }

  message += '</table><br>Terima Kasih.</body></html>'
  const mailOptions = {
    from: 'noreply@smi.com',
    to: customer.email,
    subject: 'Selamat Anda berhasil membuat Quotation SMI',
    html: message,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      log('Fail sent email :', error)
    } else {
      log(`Email to ${customer.email} sent: ${info.response}`)
    }
  })
}

const SendEmailReminder = (customer, newValue) => {
  let message =
    `<html>
    <head>
      <style> table, th, td { border: 1px solid black; border-collapse: collapse; }
      </style>
    </head>
    <body>` +
    `Quotation anda akan kadalursa 4 hari lagi, segera selesaikan quotation anda <br>` +
    `Berikut detail quotation anda: <br>` +
    `Nama Customer: ${customer.name}<br>` +
    `No Quotation: ${newValue.quoNo}<br>` +
    `Tanggal Quotation: ${newValue.createdAt.toLocaleString()}<br>` +
    `Pembayaran: ${newValue.payment}<br>` +
    `Pengiriman: ${newValue.delivery}<br>` +
    `Tanggal Pengiriman: ${newValue.deliveryDate.toLocaleString()}<br>` +
    `Note: ${newValue.note ? newValue.note : '-'} <br><br>` +
    `<table style="width: 100%">` +
    `<thead>` +
    `<th>Kode Barang</th>` +
    `<th>Nama Barang</th>` +
    `<th>Qty/Pack</th>` +
    `<th>Quantity</th>` +
    `<th>Status</th>` +
    `</thead>`

  for (const {
    itemNo,
    itemName,
    qtyPack,
    quantity,
    status,
  } of newValue.detail) {
    message +=
      `<tr><td>${itemNo}</td>` +
      `<td>${itemName}</td>` +
      `<td>${qtyPack}</td>` +
      `<td>${quantity}</td>` +
      `<td>${status}</td>` +
      `</tr>`
  }

  message += '</table><br>Terima Kasih.</body></html>'
  const mailOptions = {
    from: 'noreply@smi.com',
    to: customer.email,
    subject: 'Quotation Anda akan kadaluarsa 4 hari lagi!',
    html: message,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      log('Fail sent email :', error)
    } else {
      log(`Email to ${customer.email} sent: ${info.response}`)
    }
  })
}

const UpsertQuotation = async (body) => {
  body = await joi
    .object({
      customerId: joi.number().required(),
      quoNo: joi.string().required(),
      quoDate: joi.date().required(),
      deliveryDate: joi.date().required(),
      payment: joi.string().required(),
      delivery: joi.string().required(),
      deliveryCost: joi.number().required(),
      detail: joi
        .array()
        .items(
          joi.object({
            itemNo: joi.string().required(),
            itemName: joi.string().required(),
            qtyPack: joi.number().required(),
            quantity: joi.number().required(),
            price: joi.number().required(),
            amount: joi.number().required(),
            status: joi.string().required(),
          }),
        )
        .required(),
      subTotal: joi.number().required(),
      totalOrder: joi.number().required(),
      note: joi.string().optional(),
    })
    .validateAsync(body)
  const newData = await Quotation.findOneAndUpdate(
    { quoNo: body.quoNo },
    body,
    { new: true, upsert: true, rawResult: true },
  ).lean()
  const newValue = newData.value

  if (!newData.lastErrorObject.updatedExisting) {
    const customer = await Customer.findOne({
      customerId: body.customerId,
    }).lean()

    SendRecapEmailQuo(customer, newValue)
  }

  return newValue
}

const DeleteQuotation = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.objectId().required(),
    })
    .validateAsync(body)
  const dataDeleted = await Quotation.delete({ _id })

  return dataDeleted
}

const GetQuotation = async (body) => {
  const { _id } = await joi
    .object({
      _id: joi.string().required(),
    })
    .validateAsync(body)
  const quotation = await Quotation.findOne({ _id }).lean()

  return quotation
}

const GetDeliveryOption = () => {
  const detailDelivery = [
    {
      name: 'Gosend',
      cost: 10000,
    },
    {
      name: 'GrabExpress',
      cost: 20000,
    },
    {
      name: 'JNE',
      cost: 10000,
    },
    {
      name: 'Ambil sendiri',
      cost: 0,
    },
    {
      name: 'Gratis Ongkir',
      cost: 0,
    },
  ]

  return detailDelivery
}

const NotifExpireQuotation = async () => {
  const quoAlmostExpires = await Quotation.aggregate([
    {
      $project: {
        name: 1,
        quoNo: 1,
        createdAt: 1,
        payment: 1,
        delivery: 1,
        deliveryDate: 1,
        note: 1,
        detail: 1,
        customerId: 1,
        daySince: {
          $trunc: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },
    { $match: { daySince: { $gte: 10 } } },
  ])
  const sendMailCustomer = async (quo) => {
    const customer = await Customer.findOne({
      customerId: quo.customerId,
    }).lean()

    SendEmailReminder(customer, quo)
  }
  const doPromises = []

  quoAlmostExpires.map((quo) => doPromises.push(sendMailCustomer(quo)))

  return Promise.all(doPromises)
}

const CheckQuotationExpired = async () => {
  const quotationExpires = await Quotation.aggregate([
    {
      $project: {
        daySince: {
          $trunc: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    },
    { $match: { daySince: { $gte: 14 } } },
  ])
  const doPromises = []

  quotationExpires.map((quoExpire) =>
    doPromises.push(Quotation.deleteById(quoExpire._id)),
  )

  return Promise.all(doPromises)
}

module.exports = {
  GetQuotations,
  GetQuotation,
  UpsertQuotation,
  DeleteQuotation,
  GetDeliveryOption,
  CheckQuotationExpired,
  NotifExpireQuotation,
}
