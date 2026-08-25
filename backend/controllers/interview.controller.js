const Interview = require("../models/interview.model");
const { generateInterviewQuestions } = require("../services/ai.service");

const Report = require("../models/report.model");
const { sendError } = require("../middlewares/error.middleware");

const createInterview = async (req, res) => {
  try {
    const {
      role,
      experience,
      interviewType,
      difficulty,
      topics,
      duration,
      totalQuestions,
    } = req.body;

    if (!role || !experience) {
      return res.status(400).json({
        success: false,
        message: "Role and experience are required",
      });
    }

    const interview = await Interview.create({
      user: req.user._id,
      role,
      experience,
      interviewType: interviewType || "technical",
      difficulty: difficulty || "medium",
      topics: topics || [],
      duration: duration || 20,
      totalQuestions: totalQuestions || 10,
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    sendError(res, error, "Server error");
  }
};

const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch interviews");
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this interview",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    sendError(res, error, "Failed to fetch interview");
  }
};

const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this interview",
      });
    }

    if (interview.status !== "created") {
      return res.status(400).json({
        success: false,
        message: "Interview has already been started",
      });
    }

    const previousInterviews = await Interview.find({
      user: req.user._id,
      _id: { $ne: interview._id },
    })
      .select("questions")
      .sort({ createdAt: -1 })
      .limit(5);

    const previousQuestions = previousInterviews.flatMap((oldInterview) =>
      oldInterview.questions.map((question) => question.question),
    );

    const questions = await generateInterviewQuestions({
      role: interview.role,
      experience: interview.experience,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      topics: interview.topics,
      totalQuestions: interview.totalQuestions,
      previousQuestions,
    });

    interview.questions = questions.map((question) => ({
      question,
    }));

    interview.currentQuestion = 0;
    interview.status = "in-progress";
    interview.startedAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview started successfully",
      question: interview.questions[0].question,
      interview,
    });
  } catch (error) {
    sendError(res, error, "Failed to start interview");
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { answer, questionIndex } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this interview",
      });
    }

    if (interview.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is not in progress",
      });
    }

    if (questionIndex !== interview.currentQuestion) {
      return res.status(409).json({
        success: false,
        message: "Question is out of sync. Please refresh the interview.",
      });
    }

    const currentQuestionIndex = interview.currentQuestion;

    const currentQuestion = interview.questions[currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "Current question not found",
      });
    }

    // Save the candidate's answer.
    // No Gemini call is made here.
    currentQuestion.userAnswer = answer.trim();

    const answeredCount = interview.currentQuestion + 1;
    const reachedQuestionLimit = answeredCount >= interview.totalQuestions;

    if (reachedQuestionLimit) {
      interview.currentQuestion += 1;

      await interview.save();

      return res.status(200).json({
        success: true,
        message: "Answer saved successfully",
        isComplete: true,
        interview,
      });
    }

    interview.currentQuestion += 1;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      nextQuestion: interview.questions[interview.currentQuestion].question,
      isComplete: false,
      interview,
    });
  } catch (error) {
    sendError(res, error, "Failed to save answer");
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this interview",
      });
    }

    // Delete associated report
    await Report.deleteOne({
      interview: interview._id,
    });

    // Delete interview
    await Interview.deleteOne({
      _id: interview._id,
    });

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete interview");
  }
};

const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this interview",
      });
    }

    if (interview.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is not in progress",
      });
    }

    const answeredQuestions = interview.questions.filter((question) =>
      question.userAnswer?.trim(),
    );

    if (answeredQuestions.length === 0) {
      interview.score = 0;
    }

    interview.status = "completed";
    interview.completedAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      score: interview.score,
      interview,
    });
  } catch (error) {
    sendError(res, error, "Failed to complete interview");
  }
};

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
  completeInterview,
  deleteInterview,
};
