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
const ejs = require('ejs')
const pdf = require('html-pdf')
const path = require('path')

joi.objectId = require('joi-objectid')(joi)

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
    salesman,
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
      salesman: joi.objectId().optional(),
    })
    .validateAsync(query)
  const [quotations, total] = await Promise.all([
    Quotation.find({
      ...(dateFrom && dateTo
        ? { createdAt: { $gte: dateFrom, $lte: dateTo } }
        : {}),
      ...(personNo ? { personNo } : {}),
      ...(salesman ? { salesman } : {}),
      ...(status ? { status } : {}),
      ...(itemNo ? { 'detail.itemNo': new RegExp(itemNo, 'gi') } : {}),
      ...(itemName ? { 'detail.itemName': new RegExp(itemName, 'gi') } : {}),
    })
      .sort({ _id: -1 })
      .skip(skip * limit)
      .limit(limit)
      .deepPopulate(['salesman'])
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat().format(value)
}

const GenerateReport = async (customer, newData) => {
  const ppn = customer.isTax ? newData.totalOrder * 0.1 : 0

  const details = newData.detail.map((det) => {
    det.price = formatCurrency(det.price)
    det.amount = formatCurrency(det.amount)

    return det
  })
  const data = {
    salesQuoNo: newData.quoNo,
    companyName: customer.name,
    contactPerson: customer.contact ? customer.contact : customer.name,
    phoneNumber: customer.phone,
    email: customer.email,
    reference: newData.reference,
    date: moment(newData.quoDate).format('LL'),
    preparedBy: newData.salesman.firstName,
    validity: newData.validity,
    delivery: newData.delivery,
    payment: newData.payment,
    tax: customer.isTax ? 'PPN' : '-',
    details,
    notes: newData.note,
    subTotal: formatCurrency(newData.subTotal),
    totalOrder: formatCurrency(newData.totalOrder),
    ppn,
    netTotal: formatCurrency(newData.subTotal),
    grandTotal: formatCurrency(newData.totalOrder + ppn),
  }
  const html = await ejs.renderFile(
    path.join(__dirname, '../utils/view_pdf/', 'design.ejs'),
    data,
    { async: true },
  )

  const options = {
    width: '800px',
    header: {
      height: '0',
    },
  }

  // pdf
  //   .create(html, options)
  //   .toFile(path.join(__dirname, '../utils/view_pdf/125.pdf'), (err, res) => {
  //     if (err) {
  //       log('error report', err)
  //     }
  //     log(res.filename)
  //   })
  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        reject(err)
        throw err
      }

      resolve(buffer)
    })
  })
}

const SendRecapEmailQuo = async (customer, newData) => {
  const message = `<html><body>
    Dear ${customer.name}, <br><br>

    Terima kasih atas kesempatan yang telah Bpk/Ibu berikan untuk memberikan penawaran harga ini. <br>
    Terlampir adalah penawaran dengan harga terbaik dari kami. <br>
    Kami tunggu kabar baik ${customer.name} untuk Purchase Ordernya. <br>
    Sekian yang dapat kami sampaikan. <br><br>
    
    Terima kasih. <br><br>
     
    Regards, <br>
    ${newData.salesman.firstName} 
    </body></html>`

  const mailOptions = {
    from: 'noreply@smi.com',
    to: customer.email,
    subject: `Quotation No. ${newData.quoNo}`,
    html: message,
    attachments: [
      {
        filename: `${newData.quoNo}.pdf`,
        content: await GenerateReport(customer, newData),
      },
    ],
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      log('Fail sent email :', error)
    } else {
      log(`Email to ${customer.email} sent: ${info.response}`)
    }
  })
}

const SendEmailReminder = (customer, newData) => {
  const ppn = customer.isTax ? newData.totalOrder * 0.1 : 0
  let message = `<html>
    <head>
      <style> table, th, td { border: 1px solid black; border-collapse: collapse; }
      </style>
    </head>
    <body>
    Dear ${customer.name}<br>
    Kami ingin mengingatkan kembali untuk Quotation Bpk/Ibu akan kadaluarsa 3 hari lagi, <br>
    jika masih berkenan segera lakukan penyelesaian sebelum kadaluarsa secara otomatis. <br>
    Dengan detail quotation sbb: <br><br>
    No Quotation: <b>${newData.quoNo}</b><br>
    Tanggal Quotation: <b>${moment(newData.createdAt).format('LL')}</b><br>
    Pembayaran: <b>${newData.payment}</b><br>
    Pengiriman: <b>${newData.delivery}</b><br>
    Tanggal Pengiriman: <b>${moment(newData.deliveryDate).format('LL')}</b><br>
    Note: <b>${newData.note ? newData.note : '-'} </b><br><br>
    <table style="width: 80%">
    <thead>
    <th>Kode Barang</th>
    <th>Nama Barang</th>
    <th>Qty/Pack</th>
    <th>Quantity</th>
    <th>Status</th>
    </thead>`

  for (const {
    itemNo,
    itemName,
    qtyPack,
    quantity,
    status,
  } of newData.detail) {
    message += `<tr><td>${itemNo}</td>
      <td>${itemName}</td>
      <td>${qtyPack}</td>
      <td>${quantity}</td>
      <td>${status}</td>
      </tr>`
  }

  message += `</table>
  Sub Total: <b>${formatCurrency(newData.subTotal)} </b><br>
  Nett Total: <b>${formatCurrency(newData.subTotal)} </b><br>   
  PPN: <b>${ppn} </b><br>
  Grand Total: <b>${formatCurrency(newData.totalOrder + ppn)} </b>
  <br><br>Terima Kasih.<br><br>
  Regards, <br>
  ${newData.salesman.firstName}
  </body></html>`
  const mailOptions = {
    from: 'noreply@smi.com',
    to: customer.email,
    subject: `Quotation anda No. ${newData.quoNo} akan kadaluarsa 3 hari lagi!`,
    html: message,
  }

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      log('Fail sent email :', error)
    } else {
      log(`Email to ${customer.email} sent: ${info.response}`)
      await Quotation.findOneAndUpdate(
        { quoNo: newData.quoNo },
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
                unit: joi.string().required(),
              }),
            )
            .required(),
          subTotal: joi.number().required(),
          totalOrder: joi.number().required(),
          note: joi.string().optional().allow(''),
          status: joi.string().default(QUEUE),
          deliveryStatus: joi.string().default('Belum Terkirim'),
          salesman: joi.objectId().required(),
          reference: joi.string().optional(),
          validity: joi.string().optional(),
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
      await new Quotation(body).save()
      newData = await Quotation.findOne({ quoNo: body.quoNo })
        .deepPopulate(['salesman'])
        .lean()
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
      $lookup: {
        from: 'salesmen',
        localField: 'salesman',
        foreignField: '_id',
        as: 'salesman',
      },
    },
    { $unwind: '$salesman' },
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
        reference: 1,
        validity: 1,
        salesman: 1,
        subTotal: 1,
        totalOrder: 1,
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
  GenerateReport,
}
