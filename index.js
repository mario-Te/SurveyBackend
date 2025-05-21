"use strict";
require("dotenv").config();
const express = require("express");
const http = require("http");
const colors = require("colors");
const fs = require("fs");
const ipAddress = require("./libs/helpers/ipAddress.js");
const mongoose = require("mongoose");
const appMiddlware = require("./libs/middlewares/appMiddleware.js");
const mongoDbPath = process.env.MONGO_DB_URL;
const routeMiddleware = require("./libs/middlewares/routeMiddleware.js");

//Getting database options from env.
const mongoDbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.MONGO_DB_USERNAME,
  pass: process.env.MONGO_DB_PASSWORD,
  dbName: process.env.MONGO_DB_NAME,
};

const uploadDir = "./uploads";
const dirs = [
  uploadDir,
  `${uploadDir}/files`,
  `${uploadDir}/images`,
  `${uploadDir}/temp`,
  `./private/logger`,
  `./private/excel`,
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const app = express();
appMiddlware(app);
const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

routeMiddleware(app);
mongoose.Promise = global.Promise;
mongoose
  .connect(mongoDbPath, mongoDbOptions)
  .then((result) => {
    console.log(
      "Mongoose Connected: ".magenta +
        "Success".green +
        " on ".magenta +
        mongoDbPath.blue
    );
  })
  .catch((error) => {
    console.log("Mongoose Connected: ".magenta + `Error: ${error}`.red);
  });

httpServer.listen(PORT, async () => {
  console.log(
    `Server is Running on `.cyan +
      `${ipAddress.getIpAddress()}:${PORT}`.magenta +
      ` NODE_ENV:`.blue +
      ` ${process.env.NODE_ENV || "development"}`.yellow
  );
});
