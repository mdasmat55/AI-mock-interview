import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyInterviews } from "../../services/dashboard.service";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const result = await getMyInterviews();

        setInterviews(result.interviews || []);
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed",
  );

  const totalInterviews = interviews.length;

  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce(
            (sum, interview) => sum + (interview.score || 0),
            0,
          ) / completedInterviews.length,
        )
      : 0;

  const bestScore =
    completedInterviews.length > 0
      ? Math.max(
          ...completedInterviews.map((interview) => interview.score || 0),
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
       

        <section className="mb-7">
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-violet-600">
                DASHBOARD
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {user?.name || "there"} 👋
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Keep practicing and improve your interview performance.
              </p>
            </div>

            <button
              onClick={() => navigate("/interview/setup")}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 sm:w-auto"
            >
              + Start Interview
            </button>
          </div>
        </section>

       
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Interviews"
              value={totalInterviews}
              icon="▣"
              accent="violet"
            />

            <StatCard
              label="Completed"
              value={completedInterviews.length}
              icon="✓"
              accent="green"
            />

            <StatCard
              label="Average Score"
              value={averageScore}
              suffix="/100"
              icon="↗"
              accent="blue"
            />

            <StatCard
              label="Best Score"
              value={bestScore}
              suffix="/100"
              icon="★"
              accent="amber"
            />
          </div>
        </section>


        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Previous Interviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your previous interview attempts.
              </p>
            </div>

            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:block">
              {interviews.length}{" "}
              {interviews.length === 1 ? "interview" : "interviews"}
            </span>
          </div>


          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />

              <p className="text-sm text-slate-500">
                Loading your interviews...
              </p>
            </div>
          )}


          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          )}


          {!loading && !error && interviews.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl text-violet-600">
                🤖
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No interviews yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Start your first AI interview and begin tracking your
                preparation progress.
              </p>

              <button
                onClick={() => navigate("/interview/setup")}
                className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
              >
                Start Your First Interview
              </button>
            </div>
          )}


          {!loading && !error && interviews.length > 0 && (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};


const StatCard = ({ label, value, suffix, icon, accent }) => {
  const accentStyles = {
    violet: {
      icon: "bg-violet-100 text-violet-600",
      border: "hover:border-violet-200",
    },

    green: {
      icon: "bg-emerald-100 text-emerald-600",
      border: "hover:border-emerald-200",
    },

    blue: {
      icon: "bg-blue-100 text-blue-600",
      border: "hover:border-blue-200",
    },

    amber: {
      icon: "bg-amber-100 text-amber-600",
      border: "hover:border-amber-200",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${style.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-slate-400">
                {suffix}
              </span>
            )}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${style.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   INTERVIEW CARD
============================================================= */

const InterviewCard = ({ interview, navigate }) => {
  const isCompleted = interview.status === "completed";

  const formattedDate = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  const score = interview.score || 0;

  /* Status styles */

  const statusStyles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",

    "in-progress": "bg-amber-50 text-amber-700 border-amber-100",

    created: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                {interview.role}
              </h3>

              <p className="mt-1 text-sm capitalize text-slate-500">
                {interview.interviewType}{" "}
                <span className="text-slate-300">•</span> {interview.difficulty}
              </p>
            </div>

            {/* Status */}

            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                statusStyles[interview.status] || statusStyles.created
              }`}
            >
              {interview.status}
            </span>
          </div>


          {interview.topics?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {interview.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}


          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
            <span>📅 {formattedDate}</span>

            <span>⏱ {interview.duration} minutes</span>
          </div>
        </div>


        <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
          {/* Score */}

          {isCompleted && (
            <div className="min-w-22.5">
              <p className="text-xs font-medium text-slate-500">Score</p>

              <p className="mt-0.5 text-2xl font-bold text-slate-900">
                {score}
                <span className="text-sm font-medium text-slate-400">/100</span>
              </p>

              {/* Score bar */}

              <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all"
                  style={{
                    width: `${Math.min(Math.max(score, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          )}


          {interview.status === "created" && (
            <button
              onClick={() => navigate(`/interview/${interview._id}/start`)}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Start Interview
            </button>
          )}

          {interview.status === "in-progress" && (
            <button
              onClick={() => navigate(`/interview/${interview._id}/start`)}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Continue
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => navigate(`/interview/${interview._id}/report`)}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              View Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
