"use strict";
const express = require("express");
const cors = require("cors");
const morganBody = require("morgan-body");
const toobusy = require("toobusy-js");
const hpp = require("hpp");
const logger = require("./winston.cjs");
const helmet = require("helmet");
const cookieSession = require("cookie-session");
const limiter = require("./limiter.js");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser").json;

const appCors = {
  allowedHeaders: ["sessionId", "Content-Type", "Authorization", "Origin"],
  origin: "*",
  methods: "GET,PUT,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

const appCookie = {
  name: process.env.secret,
  keys: [process.env.cookieName],
};

module.exports = (app) => {
  app.set("trust proxy", 1); // trust first proxy
  app.use(bodyParser());
  app.use(function (req, res, next) {
    /**
     * When your application server is under heavy network traffic, it may not be able to serve its users.
     * This is essentially a type of Denial of Service (DoS) attack. The toobusy-js module allows you to monitor the event loop.
     * It keeps track of the response time, and when it goes beyond a certain threshold, this module can indicate your server is too busy.
     * In that case, you can stop processing incoming requests and send them 503 Server Too Busy message so that your application stay responsive.
     */
    if (toobusy()) {
      logger.error("server too busy");
      return res.status(503).send("server too busy");
    }
    next();
  });

  /**
   * Brute-forcing is a common threat to all web applications. Attackers can use brute-forcing as a password guessing attack to obtain account passwords.
   * Therefore, application developers should take precautions against brute-force attacks especially in login pages.
   */
  const loginLimiter = limiter.init(5); // limit 5 requests per windowMs on login apis
  app.use("/api/auth/doctor-login", loginLimiter);
  app.use("/api/auth/user-login", loginLimiter);

  /**
   * Data Sanitization against XSS like send in request innerHtml <div id='bad-code'>String</div>
   */
  app.use(xss());

  /**
   * HTTP Parameter Pollution(HPP) is an attack in which attackers send multiple HTTP
   * parameters with the same name and this causes your application to interpret them
   * in an unpredictable way. When multiple parameter values are sent,
   * Express populates them in an array. In order to solve this issue
   */
  app.use(hpp());

  /**
   * helmet is HTTP security headers that can help you prevent some common attack vectors
   */
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  /**
   * (CORS) is a mechanism that allows restricted resources on a web page to be requested
   * from another domain outside the domain from which the first resource was served.
   */
  app.use(cors(appCors));

  /**
   * To ensure cookies don’t open your app to exploits,
   * don't use the default session cookie name and set cookie security options appropriately.
   */
  app.use(cookieSession(appCookie));

  /**
   * fixing a request size limit for all requests may not be the correct behavior,
   * since some requests may have a large payload in the request body, such as when uploading a file.
   * Also, input with a JSON type is more dangerous than a multipart input,
   * since parsing JSON is a blocking operation. Therefore,
   * you should set request size limits for different content types.
   * You can accomplish this very easily with express middleware as follows:
   */
  app.use(express.json({ limit: "350mb" }));
  app.use(express.urlencoded({ extended: true, limit: "350mb" }));

  /**
   * mongoSanitize is middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
   */
  app.use(mongoSanitize());

  app.disable("etag"); // avoid 304 cache response

  /**
   * Print every request/response details
   */
  morganBody(app, {
    logRequestBody: false,
    logResponseBody: false,
    logReqUserAgent: false,
    logResHeaderList: false,
  });
};
