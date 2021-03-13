const {
  SMIModels: { Quotation, Customer, Item, RunningNumber, PriceContract },
} = require('../daos')
const joi = require('joi')
const { USR_EMAIL, PASS_EMAIL } = process.env
const { log } = console
const _ = require('lodash')
const moment = require('moment')
const {
  StatusQuo: { QUEUE, PROCESSED, DELIVERED, SENT, CLOSED },
} = require('../constants')
const StandardError = require('../../utils/standard_error')
const numeral = require('numeral')

moment.locale('id')
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
  const {
    skip,
    limit,
    itemNo,
    itemName,
    dateFrom,
    dateTo,
    status,
    personNo,
  } = await joi
    .object({
      itemNo: joi.string().optional(),
      itemName: joi.string().optional(),
      dateFrom: joi.string().optional(),
      dateTo: joi.string().optional(),
      status: joi.string().optional(),
      skip: joi.number().min(0).max(1000).default(0),
      limit: joi.number().min(1).max(200).default(5),
      personNo: joi.string().optional(),
    })
    .validateAsync(query)
  const [quotations, total] = await Promise.all([
    Quotation.find({
      ...(dateFrom && dateTo
        ? { createdAt: { $gte: dateFrom, $lte: dateTo } }
        : {}),
      ...(personNo ? { personNo } : {}),
      ...(status ? { status } : {}),
      ...(itemNo ? { 'detail.itemNo': new RegExp(itemNo, 'gi') } : {}),
      ...(itemName ? { 'detail.itemName': new RegExp(itemName, 'gi') } : {}),
    })
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .lean(),
    Quotation.countDocuments(),
  ])

  const newQuo = await Promise.all(
    quotations.map(async (quo) => {
      const data = await Customer.findOne(
        { personNo: quo.personNo },
        { name: 1 },
      ).lean()

      quo.customerName = data ? data.name : 'NA'

      return quo
    }),
  )

  return { quotations: newQuo, total }
}

const SendRecapEmailQuo = (customer, newValue) => {
  let message =
    `<html>
      <head>
        <style> table, th, td { border: 1px solid black; border-collapse: collapse; }
        </style>
      </head>
      <body>` +
    `Hai, ${customer.name} <br>` +
    `Quotation anda berhasil dibuat dengan detail sebagai berikut: <br><br>` +
    `No Quotation: <b>${newValue.quoNo}</b><br>` +
    `Tanggal Quotation: <b>${moment(newValue.createdAt).format('LL')}</b><br>` +
    `Pembayaran: <b>${newValue.payment}</b><br>` +
    `Pengiriman: <b>${newValue.delivery}</b><br>` +
    `Tanggal Pengiriman: <b>${moment(newValue.deliveryDate).format(
      'LL',
    )}</b><br>` +
    `Note: <b>${newValue.note ? newValue.note : '-'} </b><br><br>` +
    `<table style="width: 80%">` +
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
    subject: `Quotation No. ${newValue.quoNo} berhasil dibuat.`,
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
    `Halo, ${customer.name}<br>` +
    `Kami mau mengingatkan quotation anda akan kadalursa <b>4 hari</b> lagi, ` +
    `segera selesaikan quotationnya sebelum kadaluarsa otomatis<br>` +
    `Berikut detail quotation anda: <br><br>` +
    `No Quotation: <b>${newValue.quoNo}</b><br>` +
    `Tanggal Quotation: <b>${moment(newValue.createdAt).format('LL')}</b><br>` +
    `Pembayaran: <b>${newValue.payment}</b><br>` +
    `Pengiriman: <b>${newValue.delivery}</b><br>` +
    `Tanggal Pengiriman: <b>${moment(newValue.deliveryDate).format(
      'LL',
    )}</b><br>` +
    `Note: <b>${newValue.note ? newValue.note : '-'} </b><br><br>` +
    `<table style="width: 80%">` +
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
    subject: `Quotation anda No. ${newValue.quoNo} akan kadaluarsa 4 hari lagi!`,
    html: message,
  }

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      log('Fail sent email :', error)
    } else {
      log(`Email to ${customer.email} sent: ${info.response}`)
      await Quotation.findOneAndUpdate(
        { quoNo: newValue.quoNo },
        { isRemindExpire: true },
      )
    }
  })
}

const runningQuoNo = async () => {
  const number = await RunningNumber.findOne({}, { quoNo: 1 })
  const formatDate = moment().format('MMDD')
  const formatNum = (num) => numeral(num).format('00000000')
  let quoNo

  if (number) {
    quoNo = number.quoNo ? formatNum(Number(number.quoNo) + 1) : formatNum(1)
    number.quoNo = quoNo

    await number.save()
  } else {
    quoNo = formatNum(1)
    await new RunningNumber({ quoNo }).save()
  }
  quoNo = `QUO/${formatDate}/${quoNo}` // max SONO fina is 20char

  return quoNo
}

const UpsertQuotation = async (body) => {
  try {
    if (body.status !== DELIVERED) {
      body = await joi
        .object({
          personNo: joi.string().required(),
          quoNo: joi.string().optional(),
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
          note: joi.string().optional().allow(''),
          status: joi.string().default(QUEUE),
          deliveryStatus: joi.string().default('Belum Terkirim'),
        })
        .validateAsync(body)
    }

    let newData = await Quotation.findOne({ quoNo: body.quoNo })

    if (newData) {
      if (newData.status === PROCESSED || newData.status === SENT) {
        throw new StandardError('Data sudah di proses, tidak bisa diubah')
      }
      newData = _.merge(newData, body)
      newData.save()
    } else {
      body.quoNo = await runningQuoNo()
      newData = await new Quotation(body).save()
      const customer = await Customer.findOne({
        personNo: body.personNo,
      }).lean()

      if (customer && customer.email) {
        SendRecapEmailQuo(customer, newData)
      }
    }

    return newData
  } catch (error) {
    log('UpsertQuotation:', error)
    throw new StandardError('Gagal menyimpan data quotation')
  }
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
  const { quoNo } = await joi
    .object({
      quoNo: joi.string().required(),
    })
    .validateAsync(body)
  const quotation = await Quotation.findOne({ quoNo }).lean()
  const data = await Customer.findOne(
    { personNo: quotation.personNo },
    { name: 1 },
  ).lean()

  quotation.customerName = data ? data.name : 'NA'

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
        personNo: 1,
        status: 1,
        isRemindExpire: 1,
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
    {
      $match: {
        daySince: { $gte: 1 },
        status: { $ne: CLOSED },
        isRemindExpire: false,
      },
    },
  ])
  const sendMailCustomer = async (quo) => {
    const customer = await Customer.findOne({
      personNo: quo.personNo,
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
    doPromises.push(
      Quotation.findOneAndUpdate(
        { _id: quoExpire._id },
        { status: CLOSED },
      ).lean(),
    ),
  )

  return Promise.all(doPromises)
}

const BuyItemQuoAgain = async (quoNo) => {
  const quotation = await Quotation.findOne(
    { quoNo },
    { detail: 1, personNo: 1 },
  ).lean()
  const categoryCust = await Customer.findOne(
    { personNo: quotation.personNo },
    { category: 1 },
  )
    .deepPopulate(['category'])
    .lean()

  let priceContracts = await PriceContract.find(
    {
      isContract: true,
      startAt: { $lte: new Date() },
      endAt: { $gte: new Date() },
      $or: [
        { personNos: quotation.personNo },
        {
          priceType:
            categoryCust && categoryCust.category
              ? categoryCust.category.name
              : 'NA',
        },
      ],
    },
    { details: 1 },
  )
    .sort({ _id: -1 })
    .lean()

  if (priceContracts.length === 0) {
    priceContracts = await PriceContract.find(
      {
        isContract: false,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
        priceType:
          categoryCust && categoryCust.category
            ? categoryCust.category.name
            : 'NA',
      },
      { details: 1 },
    )
      .sort({ _id: -1 })
      .lean()
  }
  const detailItemQuo = quotation.detail.map((quo) => quo.itemNo)
  let items = await Item.find({ itemNo: { $in: detailItemQuo } }).lean()

  const allPriceContracts = []

  priceContracts.map((pc) => allPriceContracts.push(...pc.details))

  items = items.map((item) => {
    const pricefromContract = allPriceContracts
      ? allPriceContracts
          .filter((pc) => pc.itemNo === item.itemNo)
          .sort((a, b) => {
            return a.lessQty ? a.lessQty - b.lessQty : 0 // asc
          })
      : false

    if (pricefromContract.length) {
      item.price = pricefromContract[0].sellPrice
      item.priceContracts = pricefromContract.sort((a, b) => {
        return a.lessQty ? b.lessQty - a.lessQty : 0 // desc
      })
      item.qtyPack = pricefromContract[0].qtyPack
    } else {
      item.price = item.price ? item.price.level1 || 0 : 0
      item.qtyPack = 1
    }
    item.availableStock =
      item.stockSMI + item.stockSupplier > 20 ? '> 20' : '< 20'

    return item
  })

  return items
}

module.exports = {
  GetQuotations,
  GetQuotation,
  UpsertQuotation,
  DeleteQuotation,
  GetDeliveryOption,
  CheckQuotationExpired,
  NotifExpireQuotation,
  BuyItemQuoAgain,
}
