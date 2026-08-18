import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createInterview } from "../../services/interview.service";
import Navbar from "../../components/Navbar";

const InterviewSetup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "Software Developer",
    experience: "Fresher",
    interviewType: "technical",
    difficulty: "medium",
    topics: "",
    duration: 20,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = {
        ...formData,
        topics: formData.topics
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean),
        duration: Number(formData.duration),
      };

      const result = await createInterview(data);

      navigate(`/interview/${result.interview._id}/start`);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Start AI Interview</h1>

          <p className="text-gray-500 mb-8">
            Configure your interview before starting.
          </p>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block font-medium mb-2">Target Role</label>

              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Software Developer"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Experience</label>

              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3+ years">3+ years</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Interview Type</label>

              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="behavioral">Behavioral</option>
                <option value="coding">Coding</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Difficulty</label>

              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Topics</label>

              <input
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="DSA, DBMS, OOP, JavaScript"
              />

              <p className="text-sm text-gray-500 mt-1">
                Separate topics with commas.
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2">Duration</label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Creating Interview..." : "Start AI Interview"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InterviewSetup;
