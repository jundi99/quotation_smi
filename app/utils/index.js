const { JWT_SECRET } = process.env
const jsonwebtoken = require('jsonwebtoken')

const JwtSign = (user) => {
  return jsonwebtoken.sign(
    { id: user.id, userName: user.userName },
    JWT_SECRET,
    {
      expiresIn: '5m',
    },
  )
}

module.exports = {
  JwtSign,
}
