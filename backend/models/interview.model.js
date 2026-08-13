const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    userAnswer: {
      type: String,
      default: "",
    },

    evaluation: {
      correctness: {
        type: Number,
        default: 0,
      },

      relevance: {
        type: Number,
        default: 0,
      },

      clarity: {
        type: Number,
        default: 0,
      },

      completeness: {
        type: Number,
        default: 0,
      },

      technicalDepth: {
        type: Number,
        default: 0,
      },

      overall: {
        type: Number,
        default: 0,
      },

      feedback: {
        type: String,
        default: "",
      },

      strengths: {
        type: [String],
        default: [],
      },

      weaknesses: {
        type: [String],
        default: [],
      },
    },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["technical", "hr", "behavioral", "coding", "mixed"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    topics: {
      type: [String],
      default: [],
    },

    duration: {
      type: Number,
      default: 20,
    },

    status: {
      type: String,
      enum: ["created", "in-progress", "completed", "abandoned"],
      default: "created",
    },

    currentQuestion: {
      type: Number,
      default: 0,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);