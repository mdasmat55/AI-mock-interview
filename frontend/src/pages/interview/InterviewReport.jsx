import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";

import {
  generateReport,
  getInterviewById,
  deleteInterview,
} from "../../services/interview.service";

const InterviewReport = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [interview, setInterview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    const loadReport = async () => {
      try {
        const result = await generateReport(interviewId);

        setReport(result.report);

        const interviewResult = await getInterviewById(interviewId);

        setInterview(interviewResult.interview);
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to generate report");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [interviewId]);

  const handleDeleteInterview = async () => {
    try {
      setDeleting(true);

      await deleteInterview(interviewId);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to delete interview");

      setDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />

            <p className="text-base font-semibold text-slate-900">
              Generating your interview report...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              AI is analyzing your performance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-500">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to generate report
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-500">{error}</p>

            <button
              onClick={() => navigate("/interview/setup")}
              className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wide text-violet-600">
            INTERVIEW COMPLETED
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your Interview Report
              </h1>

              {interview && (
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {interview.role}
                  {interview.interviewType
                    ? ` • ${interview.interviewType}`
                    : ""}
                  {interview.difficulty ? ` • ${interview.difficulty}` : ""}
                </p>
              )}
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              ✓ Completed
            </span>
          </div>
        </div>

        {/* =====================================================
            OVERALL SCORE
        ====================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall Performance
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your Overall Score
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your score is based on the AI evaluation of your answers across
                multiple interview performance categories.
              </p>
            </div>

            {/* Score Circle */}

            <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-10 border-violet-100 bg-violet-50">
              <p className="text-4xl font-bold text-violet-700">
                {report.overallScore}
              </p>

              <p className="text-xs font-medium text-slate-400">out of 100</p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SCORE CARDS
        ====================================================== */}

        <section className="mb-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ScoreCard title="Technical" score={report.technicalScore} />

            <ScoreCard
              title="Problem Solving"
              score={report.problemSolvingScore}
            />

            <ScoreCard title="Clarity" score={report.clarityScore} />

            <ScoreCard title="Completeness" score={report.completenessScore} />
          </div>
        </section>

        {/* =====================================================
            OVERALL ASSESSMENT
        ====================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <SectionHeader icon="✦" title="Overall Assessment" />

          <p className="mt-5 text-sm leading-7 text-slate-600">
            {report.summary}
          </p>
        </section>

        {/* =====================================================
            STRENGTHS + WEAKNESSES
        ====================================================== */}

        <section className="mb-6 grid gap-5 md:grid-cols-2">
          {/* Strengths */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon="✓"
              title="Strengths"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <ul className="mt-5 space-y-3">
              {report.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>

                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              icon="!"
              title="Areas to Improve"
              iconClass="bg-amber-50 text-amber-600"
            />

            <ul className="mt-5 space-y-3">
              {report.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600">
                    !
                  </span>

                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* =====================================================
            RECOMMENDATIONS
        ====================================================== */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <SectionHeader icon="→" title="Recommended Preparation" />

          <div className="mt-5 space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                  {index + 1}
                </span>

                <p className="text-sm leading-6 text-slate-600">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            QUESTION BY QUESTION REVIEW
        ====================================================== */}

        <section className="mb-8">
          <div className="mb-5">
            <p className="text-sm font-semibold text-violet-600">
              DETAILED REVIEW
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Question-by-Question Review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your answers and see how the AI evaluated each response.
            </p>
          </div>

          <div className="space-y-5">
            {interview?.questions
              ?.filter((question) => question.userAnswer?.trim())
              .map((question, index) => (
                <div
                  key={question._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                >
                  {/* Question */}

                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-600">
                        Q{index + 1}
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        Interview Question
                      </span>
                    </div>

                    <h3 className="text-base font-semibold leading-7 text-slate-900 sm:text-lg">
                      {question.question}
                    </h3>
                  </div>

                  {/* Candidate Answer */}

                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Your Answer
                    </p>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {question.userAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation */}

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      AI Evaluation
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <EvaluationScore
                        title="Correctness"
                        score={question.evaluation?.correctness}
                      />

                      <EvaluationScore
                        title="Relevance"
                        score={question.evaluation?.relevance}
                      />

                      <EvaluationScore
                        title="Clarity"
                        score={question.evaluation?.clarity}
                      />

                      <EvaluationScore
                        title="Completeness"
                        score={question.evaluation?.completeness}
                      />

                      <EvaluationScore
                        title="Technical Depth"
                        score={question.evaluation?.technicalDepth}
                      />
                    </div>
                  </div>

                  {/* AI Feedback */}

                  {question.evaluation?.feedback && (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        AI Feedback
                      </p>

                      <p className="text-sm leading-6 text-slate-600">
                        {question.evaluation.feedback}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}

                  {question.evaluation?.strengths?.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-800">
                        Strengths
                      </p>

                      <ul className="space-y-2">
                        {question.evaluation.strengths.map(
                          (strength, strengthIndex) => (
                            <li
                              key={strengthIndex}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <span className="text-emerald-600">✓</span>

                              {strength}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}

                  {question.evaluation?.weaknesses?.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-slate-800">
                        Areas to Improve
                      </p>

                      <ul className="space-y-2">
                        {question.evaluation.weaknesses.map(
                          (weakness, weaknessIndex) => (
                            <li
                              key={weaknessIndex}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <span className="text-amber-500">•</span>

                              {weakness}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/interview/setup")}
            className="rounded-xl bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
          >
            Start Another Interview
          </button>

          <button
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-7 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            Delete Interview
          </button>
        </div>
      </main>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 font-bold text-red-500">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Delete Interview?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete this interview and its report. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteInterview}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =============================================================
   SECTION HEADER
============================================================= */

const SectionHeader = ({
  icon,
  title,
  iconClass = "bg-violet-100 text-violet-600",
}) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${iconClass}`}
      >
        {icon}
      </div>

      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
  );
};

/* =============================================================
   SCORE CARD
============================================================= */

const ScoreCard = ({ title, score }) => {
  const safeScore = score ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-slate-500 sm:text-sm">{title}</p>

      <div className="mt-2 flex items-end gap-1">
        <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {safeScore}
        </p>

        <span className="mb-1 text-xs text-slate-400">/100</span>
      </div>

      {/* Score bar */}

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{
            width: `${Math.min(Math.max(safeScore, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

/* =============================================================
   EVALUATION SCORE
============================================================= */

const EvaluationScore = ({ title, score }) => {
  const safeScore = score ?? 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="truncate text-[11px] font-medium text-slate-500">{title}</p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {safeScore}
        <span className="text-xs font-medium text-slate-400">/10</span>
      </p>
    </div>
  );
};

export default InterviewReport;
