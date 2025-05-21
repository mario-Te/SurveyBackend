const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["single", "multiple", "text"],
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
