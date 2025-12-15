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
    } else {
      // Check for header
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const payload = validateToken(token);
          req.user = payload;
        } catch (error) {
           // Invalid header token
        }
      }
    }
     next();
  };
}
module.exports = { checkForAuthentication };
