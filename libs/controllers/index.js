"use strict";

const express = require("express");
const router = express.Router();

router.use("/auth", require("./authController"));
router.use("/categories", require("./categoryController"));
router.use("/survey", require("./surveyController"));
module.exports = router;
