const mongoose = require("mongoose");
require("dotenv").config();

const Question = require("./libs/models/questionModel");
const mongoDbPath = process.env.MONGO_DB_URL;
// اتصال بـ MongoDB
const mongoDbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: process.env.MONGO_DB_USERNAME,
  pass: process.env.MONGO_DB_PASSWORD,
  dbName: process.env.MONGO_DB_NAME,
};

mongoose
  .connect(mongoDbPath, mongoDbOptions)
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      const surveyId = "6829f2ca3e7b4c47552ec750"; // Employee Satisfaction Survey

      const questions = [
        {
          survey: surveyId,
          text: "How satisfied are you with your job?",
          type: "single",
          options: [
            { text: "Very satisfied" },
            { text: "Satisfied" },
            { text: "Neutral" },
            { text: "Dissatisfied" },
            { text: "Very dissatisfied" },
          ],
        },
        {
          survey: surveyId,
          text: "Which benefits do you value the most?",
          type: "multiple",
          options: [
            { text: "Health Insurance" },
            { text: "Flexible Schedule" },
            { text: "Remote Work" },
            { text: "Paid Time Off" },
          ],
        },
        {
          survey: surveyId,
          text: "What would you improve in your workplace?",
          type: "text",
          options: [],
        },
      ];

      // إدخال الأسئلة
      await Question.insertMany(questions);
    } catch (error) {
      console.error("Error inserting surveys:", error.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error("Failed to connect:", err);
  });
