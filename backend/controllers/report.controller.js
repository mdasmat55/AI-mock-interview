const Interview = require("../models/interview.model");
const Report = require("../models/report.model");

const {
  generateInterviewReport,
} = require("../services/report.service");

const createReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

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

    if (interview.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Complete the interview before generating a report",
      });
    }

    const existingReport = await Report.findOne({
      interview: interview._id,
    });

    if (existingReport) {
      return res.status(200).json({
        success: true,
        message: "Report already exists",
        report: existingReport,
      });
    }

    const reportData = await generateInterviewReport(interview);

    const report = await Report.create({
      interview: interview._id,
      user: req.user._id,

      overallScore: reportData.overallScore,
      technicalScore: reportData.technicalScore,
      problemSolvingScore: reportData.problemSolvingScore,
      clarityScore: reportData.clarityScore,
      completenessScore: reportData.completenessScore,

      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,

      summary: reportData.summary,
    });

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Create report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate interview report",
    });
  }
};

module.exports = {
  createReport,
};