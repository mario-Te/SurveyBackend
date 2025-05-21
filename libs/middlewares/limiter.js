"use strict";
const rateLimit = require("express-rate-limit");
const ResponseHelper = require("../helpers/ResponseHelper.js");

module.exports = {
  init: (max = 20) => {
    const limiterOptions = {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: max, // limit each IP to max requests per windowMs
      statusCode: 429,
      message: "You sent too many requests in last few minutes",
    };

    const limiter = rateLimit({
      windowMs: limiterOptions.windowMs,
      max: limiterOptions.max, // limit each IP to 5 requests per windowMs
      statusCode: limiterOptions.statusCode,
      message: limiterOptions.message,
      headers: true,
      skipFailedRequests: false, // Do not count failed requests (status >= 400)
      skipSuccessfulRequests: false, // Do not count successful requests (status < 400)
      keyGenerator: function (req /*, res*/) {
        // allows to create custom keys (by default user IP is used)
        return req.ip;
      },
      handler: function (req, res /*, next*/) {
        // Website you wish to allow to connect
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Request methods you wish to allow
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );

        // Request headers you wish to allow
        res.setHeader(
          "Access-Control-Allow-Headers",
          "X-Requested-With,content-type"
        );

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader("Access-Control-Allow-Credentials", true);

        return res
          .status(limiterOptions.statusCode)
          .json(ResponseHelper.badResponse(limiterOptions.message));
      },
    });
    return limiter;
  },
};
