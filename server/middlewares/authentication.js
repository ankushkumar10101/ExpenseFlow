const { validateToken } = require("../services/authentication");

function checkForAuthentication(cookieName) {
  return (req,res,next) => {
    const cookie = req.cookies[cookieName];
    if (cookie) {
      try {
        const payload = validateToken(cookie);
        req.user = payload;
      } catch (error) {
        // Token is invalid/expired - just ignore and don't set user
      }
    }
     next();
  };
}
module.exports = { checkForAuthentication };
