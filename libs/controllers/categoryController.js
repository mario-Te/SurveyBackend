const Category = require("../models/categoryModel.js");
const logger = require("../middlewares/winston.cjs");
const verifyToken = require("../middlewares/auth");
const ResponseHelper = require("../helpers/ResponseHelper");
const Variables = require("../config/constants");
const express = require("express");
const router = express.Router();
router.post(
  "/create-category",
  verifyToken([Variables.Roles.admin]),
  async (req, res) => {
    try {
      const category = await Category.create(req.body);
      return res
        .status(201)
        .json(ResponseHelper.successResponse(category, "Category created"));
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
router.get("/getCategories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(
      ResponseHelper.successResponse(
        categories.map((x) => ({
          _id: x._id,
          name: x.name,
        })),
        "Category fetched"
      )
    );
  } catch (error) {
    console.log(error);
    logger.error(error);
    return res.status(200).json(ResponseHelper.badResponse(error));
  }
});
module.exports = router;
