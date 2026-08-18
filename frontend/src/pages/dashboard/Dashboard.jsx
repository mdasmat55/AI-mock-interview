import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyInterviews } from "../../services/dashboard.service";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">AI Interview</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>

            <button
              onClick={handleLogout}
              className="border border-gray-300 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back, {user?.name} 👋</h2>

          <p className="text-gray-500 mt-2">
            Practice interviews and improve your skills.
          </p>
        </div>

        {/* Start Interview */}
        <div className="bg-black text-white rounded-2xl p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">
                Ready for your next interview?
              </h3>

              <p className="text-gray-300 mt-2">
                Practice with an AI interviewer tailored to your role.
              </p>
            </div>

            <button
              onClick={() => navigate("/interview/setup")}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
            >
              Start Interview
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total Interviews</p>

            <p className="text-3xl font-bold mt-2">{totalInterviews}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Completed</p>

            <p className="text-3xl font-bold mt-2">
              {completedInterviews.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Average Score</p>

            <p className="text-3xl font-bold mt-2">
              {averageScore}
              <span className="text-base text-gray-400">/100</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Best Score</p>

            <p className="text-3xl font-bold mt-2">
              {bestScore}
              <span className="text-base text-gray-400">/100</span>
            </p>
          </div>
        </div>

        {/* Previous Interviews */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold">Previous Interviews</h3>

            <span className="text-gray-500">
              {interviews.length} interview
              {interviews.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && (
            <div className="bg-white rounded-xl p-8 text-center">
              Loading interviews...
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-600 rounded-xl p-4">
              {error}
            </div>
          )}

          {!loading && !error && interviews.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center">
              <h4 className="text-xl font-semibold">No interviews yet</h4>

              <p className="text-gray-500 mt-2">
                Start your first AI interview to see it here.
              </p>

              <button
                onClick={() => navigate("/interview/setup")}
                className="bg-black text-white px-6 py-3 rounded-lg mt-5"
              >
                Start Your First Interview
              </button>
            </div>
          )}

          {!loading && !error && interviews.length > 0 && (
            <div className="grid gap-4">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Interview Information */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold">{interview.role}</h4>

              <p className="text-gray-500 mt-1 capitalize">
                {interview.interviewType} • {interview.difficulty}
              </p>
            </div>

            {/* Status */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                interview.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : interview.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {interview.status}
            </span>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mt-4">
            {interview.topics?.map((topic) => (
              <span
                key={topic}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Date + Duration */}
          <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
            <span>📅 {formattedDate}</span>

            <span>⏱️ {interview.duration} minutes</span>
          </div>
        </div>

        {/* Score + Action */}
        <div className="flex items-center gap-6">
          {isCompleted && (
            <div className="text-center min-w-22.5">
              <p className="text-sm text-gray-500">Score</p>

              <p className="text-2xl font-bold">
                {score}
                <span className="text-sm text-gray-400">/100</span>
              </p>

              {/* Score bar */}
              <div className="w-20 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{
                    width: `${Math.min(score, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {isCompleted && (
            <button
              onClick={() => navigate(`/interview/${interview._id}/report`)}
              className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
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
