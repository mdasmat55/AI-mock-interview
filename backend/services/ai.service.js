const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const useMockAI = process.env.GEMINI_MODE === "mock";


// --------------------------------------------------
// MOCK QUESTIONS
// --------------------------------------------------

const mockQuestions = {
  DSA: [
    "Write a function to find the second largest element in an array without using any built-in sorting functions.",
    "Write a function that reverses an array in-place without using any built-in array reversal methods.",
    "Explain the difference between an array and a linked list and discuss their time complexities.",
    "What is the difference between BFS and DFS? Give a use case for each.",
  ],

  DBMS: [
    "What is database normalization? Explain 1NF, 2NF, and 3NF.",
    "What is the difference between a primary key and a foreign key?",
    "Explain the ACID properties of a database transaction.",
  ],

  OOP: [
    "What are the four fundamental principles of object-oriented programming?",
    "What is the difference between method overloading and method overriding?",
    "Explain inheritance and give a practical example.",
  ],

  JavaScript: [
    "What is the difference between var, let, and const in JavaScript?",
    "Explain the difference between == and === in JavaScript.",
    "What is a closure in JavaScript? Give an example.",
  ],
};


// --------------------------------------------------
// GET MOCK QUESTION
// --------------------------------------------------

const getMockQuestion = (topics, previousQuestions = []) => {
  const topic = topics?.[0] || "DSA";

  const questions =
    mockQuestions[topic] || mockQuestions.DSA;

  const availableQuestions = questions.filter(
    (question) => !previousQuestions.includes(question)
  );

  if (availableQuestions.length === 0) {
    return questions[
      previousQuestions.length % questions.length
    ];
  }

  return availableQuestions[0];
};


// --------------------------------------------------
// GENERATE FIRST QUESTION
// --------------------------------------------------

const generateFirstQuestion = async ({
  role,
  experience,
  interviewType,
  difficulty,
  topics,
}) => {

  // MOCK MODE
  if (useMockAI) {
    return getMockQuestion(topics);
  }


  // GEMINI MODE

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


// --------------------------------------------------
// MOCK EVALUATION
// --------------------------------------------------

const generateMockEvaluation = (userAnswer) => {

  const hasAnswer =
    userAnswer && userAnswer.trim().length > 10;

  if (!hasAnswer) {
    return {
      correctness: 0,
      relevance: 0,
      clarity: 0,
      completeness: 0,
      technicalDepth: 0,
      overall: 0,
      feedback: "The answer was too short to evaluate.",
      strengths: [],
      weaknesses: [
        "Answer needs more explanation.",
        "Provide a complete solution.",
      ],
    };
  }

  return {
    correctness: 7,
    relevance: 8,
    clarity: 7,
    completeness: 7,
    technicalDepth: 6,
    overall: 7,
    feedback:
      "This is a mock evaluation used for development and testing.",
    strengths: [
      "The candidate attempted the problem.",
      "The answer is relevant to the interview question.",
    ],
    weaknesses: [
      "The explanation could be more detailed.",
      "Complexity analysis could be improved.",
    ],
  };
};


// --------------------------------------------------
// EVALUATE ANSWER + GENERATE NEXT QUESTION
// --------------------------------------------------

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

  // MOCK MODE
  if (useMockAI) {

    const evaluation =
      generateMockEvaluation(userAnswer);

    const nextQuestion = getMockQuestion(
      topics,
      previousQuestions
    );

    return {
      evaluation,
      nextQuestion,
    };
  }


  // GEMINI MODE

  const prompt = `
You are a professional ${interviewType} interviewer.

Candidate information:
Role: ${role}
Experience: ${experience}
Difficulty: ${difficulty}
Topics: ${topics.join(", ")}

IMPORTANT:
Evaluate ONLY the candidate's answer against the CURRENT interview question.
Do NOT evaluate the answer against a previous or future question.

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