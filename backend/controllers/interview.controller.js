const Interview = require("../models/interview.model");

const createInterview = async (req, res) => {
  try {
    const {
      role,
      experience,
      interviewType,
      difficulty,
      topics,
      duration,
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
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createInterview,
};