"use strict";
const winston = require("winston");
const { format } = require("winston");
const { combine, timestamp, label, printf } = format;
const dir = `./private/logger/`;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}, ${level}:\nmessage: ${message}\n---------------------------------------------`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), myFormat),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `info.log`
    // - Write all logs with level `debug` and below to `debug.log`
    //
    new winston.transports.File({
      filename: dir + "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: dir + "debug.log",
      level: "debug",
    }),
    new winston.transports.File({ filename: dir + "info.log", level: "info" }),
  ],
});

module.exports = logger;
