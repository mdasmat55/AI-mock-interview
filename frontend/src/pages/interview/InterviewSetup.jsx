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
    totalQuestions: 10,
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
        totalQuestions: Number(formData.totalQuestions),
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <p className="text-sm font-semibold tracking-wide text-violet-600">
            INTERVIEW SETUP
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Start AI Interview
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Customize your interview before you begin.
          </p>
        </div>

        {/* =====================================================
            FORM CARD
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Intro */}

          <div className="mb-6 flex items-start gap-3 rounded-xl bg-violet-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-sm text-violet-600">
              🤖
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Configure your AI interview
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Choose the role, interview style, difficulty, topics, and
                duration that match your preparation goals.
              </p>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* =================================================
                ROLE + EXPERIENCE
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectOrInput
                label="Target Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Software Developer"
              />

              <SelectField
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                options={[
                  ["Fresher", "Fresher"],
                  ["0-1 years", "0-1 years"],
                  ["1-3 years", "1-3 years"],
                  ["3+ years", "3+ years"],
                ]}
              />
            </div>

            {/* =================================================
                INTERVIEW TYPE + DIFFICULTY
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Interview Type"
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                options={[
                  ["technical", "Technical"],
                  ["hr", "HR"],
                  ["behavioral", "Behavioral"],
                  ["coding", "Coding"],
                  ["mixed", "Mixed"],
                ]}
              />

              <SelectField
                label="Difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                options={[
                  ["easy", "Easy"],
                  ["medium", "Medium"],
                  ["hard", "Hard"],
                ]}
              />
            </div>

            {/* =================================================
                TOPICS
            ================================================== */}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Topics
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-violet-500">
                  &lt;/&gt;
                </span>

                <input
                  name="topics"
                  value={formData.topics}
                  onChange={handleChange}
                  placeholder="DSA, DBMS, OOP, JavaScript"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Separate multiple topics with commas.
              </p>
            </div>

            {/* =================================================
                DURATION + QUESTIONS
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                options={[
                  ["10", "10 minutes"],
                  ["20", "20 minutes"],
                  ["30", "30 minutes"],
                  ["45", "45 minutes"],
                ]}
              />

              <SelectField
                label="Number of Questions"
                name="totalQuestions"
                value={formData.totalQuestions}
                onChange={handleChange}
                options={[
                  ["5", "5 questions"],
                  ["10", "10 questions"],
                  ["15", "15 questions"],
                  ["20", "20 questions"],
                ]}
              />
            </div>

            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Interview Summary
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryItem label="Role" value={formData.role} />

                <SummaryItem label="Type" value={formData.interviewType} />

                <SummaryItem label="Difficulty" value={formData.difficulty} />

                <SummaryItem
                  label="Duration"
                  value={`${formData.duration} min`}
                />
              </div>
            </div>

            {/* =================================================
                BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Interview..." : "Start AI Interview →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

/* =============================================================
   INPUT FIELD
============================================================= */

const SelectOrInput = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">
          💼
        </span>

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
        />
      </div>
    </div>
  );
};

/* =============================================================
   SELECT FIELD
============================================================= */

const SelectField = ({ label, name, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
};

/* =============================================================
   SUMMARY ITEM
============================================================= */

const SummaryItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold capitalize text-slate-700">
        {value}
      </p>
    </div>
  );
};

export default InterviewSetup;
