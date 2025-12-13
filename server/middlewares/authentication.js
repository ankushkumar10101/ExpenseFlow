const { validateToken } = require("../services/authentication");

function checkForAuthentication(cookieName) {
  return (req,res,next) => {
    const cookie = req.cookies[cookieName];
    if (cookie) {
      const payload = validateToken(cookie);
      req.user = payload;
    }
     next();
  };
}
module.exports = { checkForAuthentication };
