const express = require("express");
const router = express.Router();
const Survey = require("../models/surveyModel");
const Question = require("../models/questionModel");
const verifyToken = require("../middlewares/auth");
const ResponseHelper = require("../helpers/ResponseHelper");
const Variables = require("../config/constants");
const logger = require("../middlewares/winston.cjs");
const UserAnswer = require("../models/answersModel");
router.post(
  "/create",
  verifyToken([Variables.Roles.admin]),
  async (req, res) => {
    try {
      const { title, category, questions } = req.body;
      const savedQuestions = await Question.insertMany(
        questions.map((q) => ({ ...q }))
      );
      const survey = await Survey.create({
        title,
        category,
        questions: savedQuestions.map((q) => q._id),
        createdBy: req.user.id,
      });
      res
        .status(201)
        .json(ResponseHelper.successResponse(survey, "Survey created"));
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);

router.post(
  "/getAll",
  verifyToken(Object.values(Variables.Roles)),
  async (req, res) => {
    try {
      const filter = {};
      if (req.body.category) {
        filter["category"] = req.body.category;
      }
      const surveys = await Survey.find(filter).populate("category");
      res
        .status(200)
        .json(ResponseHelper.successResponse(surveys, "get surveys"));
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);

router.get(
  "/getSurveyDetailsByName",
  verifyToken([Variables.Roles.user, Variables.Roles.admin]),
  async (req, res) => {
    try {
      const { title } = req.query;

      if (!title) {
        return res
          .status(400)
          .json(ResponseHelper.badResponse("Survey title is required"));
      }

      const survey = await Survey.findOne({ title });

      if (!survey) {
        return res
          .status(404)
          .json(ResponseHelper.badResponse("Survey not found"));
      }
      const questions = await Question.find({ survey: survey._id });
      res
        .status(200)
        .json(
          ResponseHelper.successResponse(
            questions,
            "Survey questions retrieved successfully"
          )
        );
    } catch (error) {
      console.error(error);
      res.status(500).json(ResponseHelper.badResponse("Server error"));
    }
  }
);

router.post(
  "/submit-votes",
  verifyToken([Variables.Roles.user]),
  async (req, res) => {
    try {
      const { surveyId, answers } = req.body;
      const userId = req._id;
      if (!surveyId || !Array.isArray(answers)) {
        return res.status(400).json(ResponseHelper.badResponse("Invalid data"));
      }

      const userAnswer = new UserAnswer({ surveyId, userId, answers });
      await userAnswer.save();

      res
        .status(201)
        .json(
          ResponseHelper.successResponse(
            userAnswer,
            "Answers submitted successfully"
          )
        );
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
router.get(
  "/my-answers",
  verifyToken([Variables.Roles.user]),
  async (req, res) => {
    try {
      const userId = req._id;

      const userAnswers = await UserAnswer.find({ userId })
        .populate("surveyId", "title description")
        .populate({
          path: "answers.questionId", // populate question for each answer
          select: "text type options", // select question fields including options
        });
      res
        .status(200)
        .json(
          ResponseHelper.successResponse(
            userAnswers,
            "answers fetched successfully"
          )
        );
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
router.get(
  "/check",
  verifyToken([Variables.Roles.user, Variables.Roles.admin]),
  async (req, res) => {
    const { title } = req.query;
    try {
      const survey = await Survey.findOne({ title });
      const userAnswers = await UserAnswer.findOne({
        surveyId: survey._id,
        userId: req._id,
      });
      const flag = userAnswers != null;
      res
        .status(200)
        .json(ResponseHelper.successResponse(flag, "successfully"));
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
router.get(
  "/stats",
  verifyToken([Variables.Roles.user, Variables.Roles.admin]),
  async (req, res) => {
    const { title } = req.query;
    try {
      const survey = await Survey.findOne({ title });
      const userAnswers = await UserAnswer.find({ surveyId: survey._id });
      // 2. Aggregate stats per question
      const statsMap = new Map();

      userAnswers.forEach((userAnswer) => {
        userAnswer.answers.forEach((answer) => {
          if (!statsMap.has(answer.questionId.toString())) {
            statsMap.set(answer.questionId.toString(), {
              questionId: answer.questionId,
              type: answer.type,
              responses: [],
            });
          }

          const entry = statsMap.get(answer.questionId.toString());
          if (answer.type === "multiple") {
            (answer.answer || []).forEach((opt) => entry.responses.push(opt));
          } else {
            entry.responses.push(answer.answer);
          }
        });
      });

      // 3. Fetch question details
      const questionIds = [...statsMap.keys()];
      const questions = await Question.find({ _id: { $in: questionIds } });

      const stats = questions.map((question) => {
        const entry = statsMap.get(question._id.toString());
        const responseSummary = {};

        if (entry.type === "single" || entry.type === "multiple") {
          for (const option of question.options) {
            const count = entry.responses.filter(
              (r) => r?.toString() === option._id.toString()
            ).length;
            responseSummary[option.text] = count;
          }
        } else if (entry.type === "text") {
          responseSummary["responses"] = entry.responses;
        }

        return {
          question: question.text,
          type: entry.type,
          summary: responseSummary,
        };
      });

      res
        .status(200)
        .json(
          ResponseHelper.successResponse(stats, "Stats fetched successfully")
        );
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
router.post(
  "/create-survey",
  verifyToken([Variables.Roles.admin]),
  async (req, res) => {
    try {
      const createdBy = req._id;
      const { title, description, category, questions } = req.body;

      // Create survey
      const survey = new Survey({ title, description, category, createdBy });
      await survey.save();

      // Create questions
      if (questions && questions.length > 0) {
        const questionDocs = questions.map((q) => ({
          survey: survey._id,
          text: q.text,
          type: q.type,
          options: q.options || [],
        }));
        await Question.insertMany(questionDocs);
        res
          .status(200)
          .json(
            ResponseHelper.successResponse(
              survey._id,
              "Survey created successfully"
            )
          );
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(200).json(ResponseHelper.badResponse(error));
    }
  }
);
module.exports = router;
