const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);
