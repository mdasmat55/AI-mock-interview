const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateInterviewQuestions = async ({
  role,
  experience,
  interviewType,
  difficulty,
  topics,
  totalQuestions,
  previousQuestions = [],
}) => {
  const prompt = `
You are a professional ${interviewType} interviewer.

Candidate information:
Role: ${role}
Experience level: ${experience}
Interview difficulty: ${difficulty}
Topics: ${topics.join(", ")}
Number of questions: ${totalQuestions}

Previous questions asked to this candidate in earlier interviews:
${
  previousQuestions.length > 0
    ? previousQuestions.map((q, index) => `${index + 1}. ${q}`).join("\n")
    : "None"
}

Generate exactly ${totalQuestions} interview questions.

Rules:
- Questions must be relevant to the candidate's role.
- Match the requested difficulty.
- Cover the provided topics appropriately.
- Questions should be suitable for a real interview.
- Do not provide answers.
- Do not provide explanations.
- Do not repeat or closely rephrase questions from the previous questions list.
- Avoid repeatedly asking common introductory questions.
- Make the questions reasonably diverse.
- Return exactly ${totalQuestions} questions.

Return ONLY valid JSON in this exact format:

{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
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

  if (!Array.isArray(result.questions)) {
    throw new Error("AI response does not contain a valid questions array");
  }

  if (result.questions.length !== totalQuestions) {
    throw new Error(
      `AI returned ${result.questions.length} questions instead of ${totalQuestions}`,
    );
  }

  const invalidQuestion = result.questions.some(
    (question) => typeof question !== "string" || question.trim().length === 0,
  );

  if (invalidQuestion) {
    throw new Error("AI returned an invalid interview question");
  }

  return result.questions.map((question) => question.trim());
};

module.exports = {
  generateInterviewQuestions,
};
