// models/UserAnswer.js
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Question",
  },
  type: { type: String, enum: ["single", "multiple", "text"], required: true },
  answer: { type: mongoose.Schema.Types.Mixed, required: true },
});

const UserAnswerSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Survey",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to your User schema
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserAnswer", UserAnswerSchema);
