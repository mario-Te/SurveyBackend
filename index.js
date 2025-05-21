"use strict";
require("dotenv").config();
const express = require("express");
const http = require("http");
const colors = require("colors");
const fs = require("fs");
const ipAddress = require("./libs/helpers/ipAddress.js");
const mongoose = require("mongoose");
const appMiddlware = require("./libs/middlewares/appMiddleware.js");
const routeMiddleware = require("./libs/middlewares/routeMiddleware.js");

// Construct MongoDB URI from env variables
const mongoDbPath = `mongodb+srv://${
  process.env.MONGO_DB_USERNAME
}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@${
  process.env.MONGO_DB_HOST
}/${
  process.env.MONGO_DB_NAME
}?retryWrites=true&w=majority&appName=MongoCluster`;

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
  .connect(mongoDbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
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
