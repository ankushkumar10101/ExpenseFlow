const JWT = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL CONFIG ERROR: JWT_SECRET environment variable is not defined in .env");
}

function createToken(user) {
  const payload = {
    username: user.username,
    email: user.email,
    _id: user._id,
  };
  const token = JWT.sign(payload, JWT_SECRET, { expiresIn: '2d' });
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, JWT_SECRET);
  return payload;
}

module.exports = {
  createToken,
  validateToken,
};
