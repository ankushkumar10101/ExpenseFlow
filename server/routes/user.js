const { Router } = require("express");
const userRoute = Router();
const userDb = require("../models/user");
const { createToken, validateToken } = require("../services/authentication");
userRoute.route("/signup").post(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.json({
      success: false,
      message: "Signup failed",
    });
  }
  //console.log("Response by signup form:", req.body);
  await userDb.create({ username, email, password });

  return res.json({
    success: true,
    message: "Signup success",
  });
});

userRoute.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  const user = await userDb.matchPassword(email, password);
  if (user) {
    //console.log("Logged in user :",user);
    const token = createToken(user);
    // console.log(token);
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    });

    return res.json({
      success: true,
      message: "Logged In Succesfully",
      token: token
    });
  } else {
    return res.json({
      success: false,
      message: "Invalid Email Or Password",
    });
  }
});

userRoute.route("/verify").get((req, res) => {
  if (req.user) {
    return res.json({ success: true, user: req.user });
  } else {
    return res.json({ success: false, message: "Not authenticated" });
  }
});
module.exports = userRoute;
