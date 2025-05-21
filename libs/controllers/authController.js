const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../models/userModel");
const logger = require("../middlewares/winston.cjs");
const ResponseHelper = require("../helpers/ResponseHelper.js");
const router = express.Router();
const verifyToken = require("../middlewares/auth.js");
const Variables = require("../config/constants");
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.secret
    );
    user.password = undefined;
    return res
      .status(200)
      .json(ResponseHelper.successResponse({ user, token }, "User registered"));
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(200).json(ResponseHelper.badResponse(error));
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json(ResponseHelper.badResponse("Invalid credentials"));
    }
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.secret
    );
    user.password = undefined;

    return res
      .status(200)
      .json(
        ResponseHelper.successResponse({ user, token }, "Login successful")
      );
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(200).json(ResponseHelper.badResponse(error));
  }
});
module.exports = router;
