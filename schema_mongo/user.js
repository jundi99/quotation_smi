/* eslint-disable no-invalid-this */
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const $NAME = 'User'
const CRUD = {
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  print: { type: Boolean, default: false },
}
const $SCHEMA = new Schema(
  {
    encryptedPassword: {
      type: String,
    },
    userName: String,
    userId: Number,
    profile: {
      fullName: String,
      userLevel: Number,
    },
    ipHistory: [
      {
        device_type: {
          type: String,
          enum: ['desktop-web', 'mobile-web', 'android', 'ios'],
        },
        device_id: String,
        device_name: String,
        date: Date,
      },
    ],
    authorize: {
      item: CRUD,
      itemCategory: CRUD,
      customer: CRUD,
      custCategory: CRUD,
      price: CRUD,
      sales: CRUD,
      user: CRUD,
      itemStock: CRUD,
      quotation: CRUD,
      priceApproval: CRUD,
      salesOrder: CRUD,
      importExcel: CRUD,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    read: 'secondary',
  },
)

$SCHEMA.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

$SCHEMA.pre('save', function presave(fun) {
  if (!this.isModified('encryptedPassword')) {
    fun()
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      fun(err)
    }
    bcrypt.hash(this.encryptedPassword, salt, (err, hash) => {
      if (err) {
        fun(err)
      }
      this.encryptedPassword = hash
      fun()
    })
  })
})

$SCHEMA.methods.comparePassword = function comparePassword(insertedPassword) {
  const { encryptedPassword } = this

  return new Promise((resolve) => {
    bcrypt.compare(insertedPassword, encryptedPassword, (err, isMatch) => {
      if (err) {
        isMatch = false
      }

      const hashPassword = crypto
        .createHash('sha1')
        .update(insertedPassword)
        .digest('hex')

      if (!isMatch) {
        if (hashPassword === encryptedPassword) {
          return resolve(true)
        }

        return resolve(false)
      }

      return resolve(isMatch)
    })
  })
}

$SCHEMA.statics.updateBrandPassword = function updateBrandPassword(
  userId,
  newPassword,
) {
  userId = newPassword.id

  return new Promise(async (resolve, reject) => {
    try {
      const user = await this.model('User').findById(userId).lean()

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err)
        }
        bcrypt.hash(this.newPassword, salt, (err, hash) => {
          if (err) {
            reject(err)
          }
          user.encryptedPassword = hash
        })
      })

      resolve(await user.save())
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  SchemaName: $NAME,
  SchemaObject: $SCHEMA,
}
