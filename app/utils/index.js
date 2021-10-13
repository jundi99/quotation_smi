const { JWT_SECRET } = process.env
const jsonwebtoken = require('jsonwebtoken')

const JwtSign = (user, expire) => {
  const newExpire = {
    expiresIn: expire || '7d',
  }

  return jsonwebtoken.sign(
    { id: user.id, userName: user.userName },
    JWT_SECRET,
    newExpire,
  )
}

module.exports = {
  JwtSign,
}
