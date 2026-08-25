const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const isValidScore = (value, min, max) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;

const generateInterviewReport = async (interview) => {
  const answeredQuestions = interview.questions.filter((q) =>
    q.userAnswer?.trim(),
  );

  if (answeredQuestions.length === 0) {
    throw new Error("No answered questions available for evaluation");
  }

  const questions = answeredQuestions
    .map(
      (q, index) => `
Question ${index + 1}:
${q.question}

Candidate Answer:
${q.userAnswer}
`,
    )
    .join("\n-------------------\n");

  const prompt = `
You are an expert interview evaluator.

Evaluate the candidate's completed interview.

Candidate Role:
${interview.role}

Experience:
${interview.experience}

Interview Type:
${interview.interviewType}

Difficulty:
${interview.difficulty}

Topics:
${interview.topics.join(", ")}

Interview Questions and Candidate Answers:
${questions}

Your task has TWO parts.

PART 1 — Evaluate every answered question

For each question, evaluate the candidate's answer using:

- correctness: 0-10
- relevance: 0-10
- clarity: 0-10
- completeness: 0-10
- technicalDepth: 0-10
- overall: 0-10

Also provide:
- feedback
- strengths
- weaknesses

PART 2 — Generate the final interview report

The report must contain:

- overallScore: 0-100
- technicalScore: 0-100
- problemSolvingScore: 0-100
- clarityScore: 0-100
- completenessScore: 0-100
- strengths: 3-5 specific points
- weaknesses: 2-5 specific points
- recommendations: 3-5 actionable recommendations
- summary: concise overall assessment

Rules:

- Evaluate ONLY the questions and answers provided.
- Do not invent information about the candidate.
- Keep question-level evaluations consistent with the final scores.
- All question-level scores must be between 0 and 10.
- All final report scores must be between 0 and 100.
- Return exactly one evaluation for every answered question.
- The evaluation order must match the question order.
- If an answer is weak, score it accordingly.
- Do not give artificially high scores.
- Do not include answers to the interview questions.

Return ONLY valid JSON in exactly this format:

{
  "evaluations": [
    {
      "questionIndex": 0,
      "correctness": 0,
      "relevance": 0,
      "clarity": 0,
      "completeness": 0,
      "technicalDepth": 0,
      "overall": 0,
      "feedback": "",
      "strengths": [],
      "weaknesses": []
    }
  ],
  "report": {
    "overallScore": 0,
    "technicalScore": 0,
    "problemSolvingScore": 0,
    "clarityScore": 0,
    "completenessScore": 0,
    "strengths": [],
    "weaknesses": [],
    "recommendations": [],
    "summary": ""
  }
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response?.text) {
    throw new Error("AI did not return a response");
  }

  let result;

  try {
    result = JSON.parse(response.text);
  } catch (error) {
    throw new Error("AI returned invalid JSON");
  }

  if (!result || typeof result !== "object") {
    throw new Error("AI returned an invalid report response");
  }

  if (!Array.isArray(result.evaluations)) {
    throw new Error("AI response does not contain valid evaluations");
  }

  if (result.evaluations.length !== answeredQuestions.length) {
    throw new Error(
      `AI returned ${result.evaluations.length} evaluations instead of ${answeredQuestions.length}`,
    );
  }

  result.evaluations.forEach((evaluation, index) => {
    if (
      evaluation.questionIndex !== index ||
      !isValidScore(evaluation.correctness, 0, 10) ||
      !isValidScore(evaluation.relevance, 0, 10) ||
      !isValidScore(evaluation.clarity, 0, 10) ||
      !isValidScore(evaluation.completeness, 0, 10) ||
      !isValidScore(evaluation.technicalDepth, 0, 10) ||
      !isValidScore(evaluation.overall, 0, 10)
    ) {
      throw new Error(
        `AI returned an invalid evaluation for question ${index + 1}`,
      );
    }

    if (
      typeof evaluation.feedback !== "string" ||
      !Array.isArray(evaluation.strengths) ||
      !Array.isArray(evaluation.weaknesses)
    ) {
      throw new Error(
        `AI returned incomplete evaluation data for question ${index + 1}`,
      );
    }
  });

  if (!result.report || typeof result.report !== "object") {
    throw new Error("AI response does not contain a valid final report");
  }

  const report = result.report;

  const reportScores = [
    report.overallScore,
    report.technicalScore,
    report.problemSolvingScore,
    report.clarityScore,
    report.completenessScore,
  ];

  if (!reportScores.every((score) => isValidScore(score, 0, 100))) {
    throw new Error("AI returned invalid final report scores");
  }

  if (
    !Array.isArray(report.strengths) ||
    !Array.isArray(report.weaknesses) ||
    !Array.isArray(report.recommendations) ||
    typeof report.summary !== "string"
  ) {
    throw new Error("AI returned incomplete final report data");
  }

  return {
    evaluations: result.evaluations,
    report: {
      overallScore: report.overallScore,
      technicalScore: report.technicalScore,
      problemSolvingScore: report.problemSolvingScore,
      clarityScore: report.clarityScore,
      completenessScore: report.completenessScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      recommendations: report.recommendations,
      summary: report.summary,
    },
  };
};

module.exports = {
  generateInterviewReport,
};
