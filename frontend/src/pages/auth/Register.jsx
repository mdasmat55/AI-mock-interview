import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    targetRole: "",
    education: "",
    skills: "",
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
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const result = await registerUser(data);

      login(result.user, result.token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold">Create Account</h1>

        <p className="text-gray-500 mt-2 mb-8">
          Create your account and start practicing interviews.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-2">Name</label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Create a password"
            />

            <p className="text-xs text-gray-400 mt-1">At least 6 characters.</p>
          </div>

          <div>
            <label className="block font-medium mb-2">Target Role</label>

            <input
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Software Developer"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Education</label>

            <input
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="MCA"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Skills</label>

            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="C++, React, Node.js"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
