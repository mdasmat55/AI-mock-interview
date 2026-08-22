import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

import {
  startInterview,
  getInterviewById,
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
  const [interviewInfo, setInterviewInfo] = useState({
    role: "",
    interviewType: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const calculateRemainingTime = (startedAt, durationMinutes) => {
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();

    const elapsedSeconds = Math.floor((now - startTime) / 1000);

    const totalSeconds = durationMinutes * 60;

    return Math.max(totalSeconds - elapsedSeconds, 0);
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setVoiceError("Voice recognition failed. Please try again.");

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const result = await getInterviewById(interviewId);

        const interview = result.interview;

        setInterviewInfo({
          role: interview.role || "Interview",
          interviewType: interview.interviewType || "",
        });

        if (interview.status === "created") {
          const startResult = await startInterview(interviewId);

          setQuestion(startResult.question);

          if (voiceMode) {
            speakQuestion(startResult.question);
          }
          setQuestionIndex(0);

          if (
            startResult.interview?.duration &&
            startResult.interview?.startedAt
          ) {
            const remainingTime = calculateRemainingTime(
              startResult.interview.startedAt,
              startResult.interview.duration,
            );

            setDuration(remainingTime);
          }
        } else if (interview.status === "in-progress") {
          // Resume existing interview
          const currentQuestion =
            interview.questions[interview.currentQuestion];

          if (!currentQuestion) {
            setError("Current question not found.");
            return;
          }

          setQuestion(currentQuestion.question);

          if (voiceMode) {
            speakQuestion(currentQuestion.question);
          }

          setQuestionIndex(interview.currentQuestion);

          if (interview.duration && interview.startedAt) {
            const remainingTime = calculateRemainingTime(
              interview.startedAt,
              interview.duration,
            );

            setDuration(remainingTime);
          }
        } else if (interview.status === "completed") {
          // Already completed
          navigate(`/interview/${interviewId}/report`);
        } else {
          setError("Invalid interview status.");
        }
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to load interview");
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId, navigate]);

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

      if (voiceMode) {
        speakQuestion(result.nextQuestion);
      }

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

  const speakQuestion = (text) => {
    if (!text || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveAndExit = () => {
    navigate("/dashboard");
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    setVoiceError("");

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        finalTranscriptRef.current = answer;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Voice start error:", error);
      }
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

              <h1 className="text-2xl font-bold">
                {interviewInfo.role || "Interview"}
              </h1>
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

                <p className="text-sm text-gray-500 capitalize">
                  {interviewInfo.interviewType
                    ? `${interviewInfo.interviewType} Interview`
                    : "Interview"}
                </p>
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

            {!voiceMode && (
              <button
                type="button"
                onClick={() => {
                  setVoiceMode(true);
                  speakQuestion(question);
                }}
                disabled={submitting}
                className="mt-3 bg-black text-white px-5 py-2.5 rounded-lg font-medium"
              >
                🎙️ Enter Voice Mode
              </button>
            )}

            {voiceMode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Voice Interview Mode</p>

                    <p className="text-sm text-gray-500">
                      Speak your answer using your microphone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        recognitionRef.current?.stop();
                      }

                      setVoiceMode(false);
                      setIsListening(false);
                      window.speechSynthesis.cancel();
                    }}
                    className="text-sm text-gray-600 border px-3 py-2 rounded-lg"
                  >
                    Exit Voice Mode
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-lg font-medium ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-black text-white"
                  }`}
                >
                  {isListening ? "🛑 Stop Listening" : "🎙️ Start Speaking"}
                </button>

                {isListening && (
                  <p className="text-sm text-red-500 mt-2">Listening...</p>
                )}
              </div>
            )}

            {voiceError && (
              <p className="text-red-500 text-sm mt-2">{voiceError}</p>
            )}

            {error && <p className="text-red-500 mt-3">{error}</p>}

            <div className="flex justify-between items-center mt-5">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAndExit}
                  disabled={submitting}
                  className="border border-gray-300 text-gray-700 px-5 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Save & Exit
                </button>

                <button
                  onClick={() => setShowEndConfirmation(true)}
                  disabled={submitting}
                  className="border border-red-500 text-red-500 px-5 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  End Interview
                </button>
              </div>

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

      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold">End Interview?</h2>

            <p className="text-gray-500 mt-3">
              Are you sure you want to end this interview? You won't be able to
              continue it after submitting.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="border border-gray-300 px-5 py-2.5 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCompleteInterview}
                disabled={submitting}
                className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
              >
                {submitting ? "Ending..." : "Yes, End Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
