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
  const hasStartedRef = useRef(false);

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
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

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

      if (result.isComplete) {
        await completeInterview(interviewId);

        navigate(`/interview/${interviewId}/report`);

        return;
      }

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

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />

            <p className="text-sm font-medium text-slate-600">
              AI is preparing your interview...
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (error && !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              !
            </div>

            <p className="mt-4 text-sm font-medium text-red-600">{error}</p>

            <button
              onClick={() => navigate("/interview/setup")}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Interview information */}

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-violet-600">
                AI INTERVIEW
              </p>

              <h1 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl">
                {interviewInfo.role || "Interview"}
              </h1>

              <p className="mt-1 text-xs capitalize text-slate-500 sm:text-sm">
                {interviewInfo.interviewType
                  ? `${interviewInfo.interviewType} interview`
                  : "Interview session"}
              </p>
            </div>

            {/* Question + Timer */}

            <div className="flex items-center gap-3">
              {/* Question */}

              <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Question
                </p>

                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {questionIndex + 1}
                </p>
              </div>

              {/* Timer */}

              <div
                className={`rounded-xl px-4 py-2.5 text-center ${
                  duration <= 60 ? "bg-red-50" : "bg-violet-50"
                }`}
              >
                <p
                  className={`text-[10px] font-medium uppercase tracking-wide ${
                    duration <= 60 ? "text-red-500" : "text-violet-500"
                  }`}
                >
                  Time Remaining
                </p>

                <p
                  className={`mt-0.5 text-lg font-bold ${
                    duration <= 60 ? "text-red-600" : "text-violet-700"
                  }`}
                >
                  {formattedTime}
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600">
              AI
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI Interviewer
              </p>

              <p className="text-xs capitalize text-slate-500">
                {interviewInfo.interviewType
                  ? `${interviewInfo.interviewType} Interview`
                  : "Interview"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-violet-50/60 p-5 sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
              Interview Question
            </p>

            <h2 className="text-lg font-medium leading-7 text-slate-900 sm:text-xl sm:leading-8">
              {question}
            </h2>
          </div>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              Your Answer
            </label>

            <span className="text-xs text-slate-400">
              {voiceMode ? "Voice mode enabled" : "Type your response"}
            </span>
          </div>

          {/* Textarea */}

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={7}
            disabled={submitting}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          />


          {!voiceMode && (
            <button
              type="button"
              onClick={() => {
                setVoiceMode(true);
                speakQuestion(question);
              }}
              disabled={submitting}
              className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
            >
              🎙️ Enter Voice Mode
            </button>
          )}


          {voiceMode && (
            <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Voice Interview Mode
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Exit Voice Mode
                </button>
              </div>

              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={submitting}
                className={`mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {isListening ? "🛑 Stop Listening" : "🎙️ Start Speaking"}
              </button>

              {isListening && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  ● Listening...
                </p>
              )}
            </div>
          )}

          {/* Voice error */}

          {voiceError && (
            <p className="mt-2 text-xs text-red-500">{voiceError}</p>
          )}

          {/* General error */}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}


          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Secondary actions */}

            <div className="flex gap-2">
              <button
                onClick={handleSaveAndExit}
                disabled={submitting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Save & Exit
              </button>

              <button
                onClick={() => setShowEndConfirmation(true)}
                disabled={submitting}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                End Interview
              </button>
            </div>

            {/* Submit */}

            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || duration <= 0}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "AI is evaluating..." : "Submit Answer →"}
            </button>
          </div>
        </div>
      </main>


      {showEndConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              End Interview?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to end this interview? You won't be able to
              continue it after submitting.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCompleteInterview}
                disabled={submitting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
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
