const express = require("express");

const { protect } = require("../middlewares/auth.middleware");

const {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
  completeInterview,
} = require("../controllers/interview.controller");

const router = express.Router();

router.post("/create", protect, createInterview);

router.get("/my-interviews", protect, getMyInterviews);

router.get("/:id", protect, getInterviewById);

router.post("/:id/start", protect, startInterview);

router.post("/:id/answer", protect, submitAnswer);

router.post("/:id/complete", protect, completeInterview);

module.exports = router;
