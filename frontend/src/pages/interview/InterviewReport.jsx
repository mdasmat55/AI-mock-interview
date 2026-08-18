import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { generateReport } from "../../services/interview.service";

const InterviewReport = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const result = await generateReport(interviewId);

        setReport(result.report);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to generate report"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">
            Generating your interview report...
          </p>

          <p className="text-gray-500 mt-2">
            AI is analyzing your performance.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error}
          </p>

          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-black text-white px-5 py-3 rounded-lg"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gray-500">
            Interview Completed
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Your Interview Report
          </h1>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mb-6">
          <p className="text-gray-500 mb-2">
            Overall Score
          </p>

          <div className="text-6xl font-bold">
            {report.overallScore}
          </div>

          <p className="text-gray-500 mt-2">
            out of 100
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <ScoreCard
            title="Technical"
            score={report.technicalScore}
          />

          <ScoreCard
            title="Problem Solving"
            score={report.problemSolvingScore}
          />

          <ScoreCard
            title="Clarity"
            score={report.clarityScore}
          />

          <ScoreCard
            title="Completeness"
            score={report.completenessScore}
          />

        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Overall Assessment
          </h2>

          <p className="text-gray-600 leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">
              Strengths
            </h2>

            <ul className="space-y-3">
              {report.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-gray-600"
                >
                  <span className="text-green-600 font-bold">
                    ✓
                  </span>

                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">
              Areas to Improve
            </h2>

            <ul className="space-y-3">
              {report.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-gray-600"
                >
                  <span className="text-red-600 font-bold">
                    !
                  </span>

                  {weakness}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Recommended Preparation
          </h2>

          <ul className="space-y-3">
            {report.recommendations.map(
              (recommendation, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-gray-600"
                >
                  <span className="font-bold">
                    {index + 1}.
                  </span>

                  {recommendation}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Action */}
        <div className="text-center">
          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold"
          >
            Start Another Interview
          </button>
        </div>

      </div>
    </div>
  );
};

const ScoreCard = ({ title, score }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
      <p className="text-sm text-gray-500 mb-2">
        {title}
      </p>

      <p className="text-3xl font-bold">
        {score}
      </p>

      <p className="text-xs text-gray-400">
        / 100
      </p>
    </div>
  );
};

export default InterviewReport;