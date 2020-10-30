const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { Schema } = mongoose
const $NAME = 'User'
const $SCHEMA = new Schema(
  {
    encrypted_password: {
      type: String,
    },
    userName: String,
    profile: {
      fullName: String,
      userId: Number,
      UserLevel: Number,
    },
    ip_history: [
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
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    read: 'secondary',
  }
)

$SCHEMA.plugin(require('mongoose-delete'), {
  overrideMethods: 'all',
})

$SCHEMA.pre('save', function presave(fun) {
  if (!this.isModified('encrypted_password')) {
    fun()
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      fun(err)
    }
    bcrypt.hash(this.encrypted_password, salt, (err, hash) => {
      if (err) {
        fun(err)
      }
      this.encrypted_password = hash
      fun()
    })
  })
})

$SCHEMA.methods.comparePassword = function comparePassword(insertedPassword) {
  const { encrypted_password } = this

  return new Promise((resolve) => {
    bcrypt.compare(insertedPassword, encrypted_password, (err, isMatch) => {
      if (err) {
        isMatch = false
      }

      const hashPassword = crypto
        .createHash('sha1')
        .update(insertedPassword)
        .digest('hex')

      if (!isMatch) {
        if (hashPassword === encrypted_password) {
          return resolve(true)
        }

        return resolve(false)
      }

      return resolve(isMatch)
    })
  })
}

$SCHEMA.statics.updateBrandPassword = function updateBrandPassword(
  user_id,
  new_password
) {
  user_id = new_password.id

  return new Promise(async (resolve, reject) => {
    try {
      const user = await this.model('User').findById(user_id).lean()

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err)
        }
        bcrypt.hash(this.new_password, salt, (err, hash) => {
          if (err) {
            reject(err)
          }
          user.encrypted_password = hash
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
