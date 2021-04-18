const { JWT_SECRET } = process.env
const jsonwebtoken = require('jsonwebtoken')

const JwtSign = (user, expire) => {
  return jsonwebtoken.sign(
    { id: user.id, userName: user.userName },
    JWT_SECRET,
    {
      expiresIn: expire || '5m',
    },
  )
}

module.exports = {
  JwtSign,
}
