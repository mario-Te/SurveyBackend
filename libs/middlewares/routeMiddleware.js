const path = require("path");
const express = require("express");
const apis = require("../controllers/index.js");

module.exports = (app) => {
  app.use("/api", apis);
  app.use("/uploads", express.static("uploads"));

  // app.use('/website', express.static('public/website'));
  // app.use('/website*', express.static('public/website', { extensions: ['html'] }));

  // app.get('/', function (req, res) { res.redirect('/website/'); });

  app.use((req, res, next) => {
    res.status(404);
    res.format({
      html() {
        res.sendFile(path.join(`${__dirname}/../../assets/html/404.html`));
      },
      json() {
        res.json({ error: "Not found" });
      },
      default() {
        res.type("txt").send("Not found");
      },
    });
  });
};
