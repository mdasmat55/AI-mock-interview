const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateFirstQuestion = async ({
  role,
  experience,
  interviewType,
  difficulty,
  topics,
}) => {
  const prompt = `
You are a professional ${interviewType} interviewer.

Candidate role: ${role}
Experience level: ${experience}
Interview difficulty: ${difficulty}
Topics: ${topics.join(", ")}

Generate the FIRST interview question for this candidate.

Rules:
- Ask only one question.
- Do not provide the answer.
- Do not provide explanations.
- Keep the question relevant to the role.
- Match the requested difficulty.
- Make it suitable for an actual interview.

Return only the question text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
};

const evaluateAnswerAndGenerateNextQuestion = async ({
  role,
  experience,
  interviewType,
  difficulty,
  topics,
  currentQuestion,
  userAnswer,
  previousQuestions,
}) => {
  const prompt = `
You are a professional ${interviewType} interviewer.

Candidate information:
Role: ${role}
Experience: ${experience}
Difficulty: ${difficulty}
Topics: ${topics.join(", ")}

Current interview question:
${currentQuestion}

Candidate's answer:
${userAnswer}

Previous questions asked:
${previousQuestions.join("\n")}

Your task has TWO parts:

1. Evaluate the candidate's answer.
2. Generate the next interview question.

Evaluation criteria:
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

For the next question:
- Ask exactly ONE question.
- Do not repeat a previous question.
- Keep it relevant to the candidate's role.
- Match the interview difficulty.
- You may ask a follow-up question if the previous answer needs deeper exploration.
- Do not provide the answer to the next question.

Return ONLY valid JSON in this exact format:

{
  "evaluation": {
    "correctness": 0,
    "relevance": 0,
    "clarity": 0,
    "completeness": 0,
    "technicalDepth": 0,
    "overall": 0,
    "feedback": "",
    "strengths": [],
    "weaknesses": []
  },
  "nextQuestion": ""
}
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
  generateFirstQuestion,
  evaluateAnswerAndGenerateNextQuestion,
};