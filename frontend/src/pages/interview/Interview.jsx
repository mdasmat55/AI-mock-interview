import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

import {
  startInterview,
  submitAnswer,
  completeInterview,
} from "../../services/interview.service";

const Interview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [duration, setDuration] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const start = async () => {
      try {
        const result = await startInterview(interviewId);

        setQuestion(result.question);

        if (result.interview?.duration) {
          setDuration(result.interview.duration * 60);
        }
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to start interview");
      } finally {
        setLoading(false);
      }
    };

    start();
  }, [interviewId]);

  useEffect(() => {
    if (loading || duration <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setDuration((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          handleAutoComplete();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  const handleAutoComplete = async () => {
    try {
      await completeInterview(interviewId);

      navigate(`/interview/${interviewId}/report`);
    } catch (error) {
      console.error("Auto complete error:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await submitAnswer(interviewId, questionIndex, answer);

      setQuestion(result.nextQuestion);
      setAnswer("");
      setQuestionIndex((prev) => prev + 1);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      setSubmitting(true);
      setError("");

      await completeInterview(interviewId);

      navigate(`/interview/${interviewId}/report`);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to complete interview");

      setSubmitting(false);
    }
  };

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">AI is preparing your interview...</p>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>

          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">AI Interview</p>

              <h1 className="text-2xl font-bold">Software Developer</h1>
            </div>

            <div className="flex items-center gap-8">
              {/* Question number */}
              <div className="text-center">
                <p className="text-sm text-gray-500">Question</p>

                <p className="text-xl font-semibold">{questionIndex + 1}</p>
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-500">Time Remaining</p>

                <p
                  className={`text-xl font-bold ${
                    duration <= 60 ? "text-red-500" : "text-black"
                  }`}
                >
                  {formattedTime}
                </p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                AI
              </div>

              <div>
                <p className="font-semibold">AI Interviewer</p>

                <p className="text-sm text-gray-500">Technical Interview</p>
              </div>
            </div>

            <h2 className="text-xl font-medium leading-relaxed">{question}</h2>
          </div>

          {/* Answer */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <label className="block font-semibold mb-3">Your Answer</label>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              disabled={submitting}
              className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <div className="flex justify-between items-center mt-5">
              <button
                onClick={handleCompleteInterview}
                disabled={submitting}
                className="border border-red-500 text-red-500 px-5 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                End Interview
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || duration <= 0}
                className="bg-black text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {submitting ? "AI is evaluating..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interview;
