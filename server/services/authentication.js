const JWT=require('jsonwebtoken')
const secretKey='scret@123'

function createToken(user){
  const payload={
    username:user.username,
    email:user.email,
    _id:user._id,
  }
  const token=JWT.sign(payload,secretKey, { expiresIn: '2d' })
  return token
}

function validateToken(token){
  const payload=JWT.verify(token,secretKey)
  return payload
}

module.exports={createToken,validateToken}