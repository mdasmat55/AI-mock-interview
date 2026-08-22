const Interview = require("../models/interview.model");
const Report = require("../models/report.model");

const { generateInterviewReport } = require("../services/report.service");
const { sendError } = require("../middlewares/error.middleware");

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

    const answeredQuestions = interview.questions.filter((question) =>
      question.userAnswer?.trim(),
    );

    if (answeredQuestions.length === 0) {
      const existingReport = await Report.findOne({
        interview: interview._id,
      });

      if (existingReport) {
        if (interview.score !== existingReport.overallScore) {
          interview.score = existingReport.overallScore;
          await interview.save();
        }

        return res.status(200).json({
          success: true,
          message: "Report already exists",
          report: existingReport,
        });
      }

      const report = await Report.create({
        interview: interview._id,
        user: req.user._id,

        overallScore: 0,
        technicalScore: 0,
        problemSolvingScore: 0,
        clarityScore: 0,
        completenessScore: 0,

        strengths: [],
        weaknesses: ["No questions were answered."],
        recommendations: [
          "Attempt the interview questions to receive a meaningful performance evaluation.",
        ],

        summary:
          "The interview was completed without answering any questions, so no performance evaluation is available.",
      });

      interview.score = 0;
      await interview.save();

      return res.status(201).json({
        success: true,
        message: "Interview report generated successfully",
        report,
      });
    }

    const existingReport = await Report.findOne({
      interview: interview._id,
    });

    if (existingReport) {
      // Self-heal older interviews saved before scores were kept in sync
      // (dashboard score used to be on a 0-10 scale instead of 0-100).
      if (interview.score !== existingReport.overallScore) {
        interview.score = existingReport.overallScore;
        await interview.save();
      }

      return res.status(200).json({
        success: true,
        message: "Report already exists",
        report: existingReport,
      });
    }

    const reportData = await generateInterviewReport(interview);

    let report;

    try {
      report = await Report.create({
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
    } catch (error) {
      // Another request may have created the report
      // while this request was generating it.
      if (error.code === 11000) {
        const existingReport = await Report.findOne({
          interview: interview._id,
        });

        return res.status(200).json({
          success: true,
          message: "Report already exists",
          report: existingReport,
        });
      }

      throw error;
    }

    // Keep the interview's score (used everywhere else, e.g. the dashboard)
    // in sync with the authoritative score shown on the report page.
    interview.score = report.overallScore;
    await interview.save();

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      report,
    });
  } catch (error) {
    sendError(res, error, "Failed to generate interview report");
  }
};

module.exports = {
  createReport,
};
