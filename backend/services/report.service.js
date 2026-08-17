const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateInterviewReport = async (interview) => {
  const questions = interview.questions
    .filter((q) => q.userAnswer.trim() !== "")
    .map((q, index) => {
      return `
Question ${index + 1}:
${q.question}

Candidate Answer:
${q.userAnswer}

Evaluation:
Correctness: ${q.evaluation.correctness}/10
Relevance: ${q.evaluation.relevance}/10
Clarity: ${q.evaluation.clarity}/10
Completeness: ${q.evaluation.completeness}/10
Technical Depth: ${q.evaluation.technicalDepth}/10
Overall: ${q.evaluation.overall}/10

Feedback:
${q.evaluation.feedback}

Strengths:
${q.evaluation.strengths.join(", ")}

Weaknesses:
${q.evaluation.weaknesses.join(", ")}
`;
    })
    .join("\n-------------------\n");

  const prompt = `
You are an expert interview evaluator.

Analyze the following completed interview.

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

Interview Data:
${questions}

Generate a concise but useful final interview report.

Return ONLY valid JSON in exactly this format:

{
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

Rules:

- All scores must be between 0 and 100.
- overallScore represents the candidate's overall interview performance.
- technicalScore represents technical knowledge.
- problemSolvingScore represents problem-solving ability.
- clarityScore represents how clearly the candidate communicated answers.
- completenessScore represents how completely the candidate answered questions.
- strengths should contain 3-5 specific points.
- weaknesses should contain 2-5 specific points.
- recommendations should contain 3-5 actionable preparation recommendations.
- summary should be a concise overall assessment.
- Base the report only on the interview data provided.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
};

module.exports = {
  generateInterviewReport,
};