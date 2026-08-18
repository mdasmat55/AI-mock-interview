import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/auth.service";
import Navbar from "../../components/Navbar";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    targetRole: user?.targetRole || "",
    education: user?.education || "",
    skills: user?.skills?.join(", ") || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      targetRole: user?.targetRole || "",
      education: user?.education || "",
      skills: user?.skills?.join(", ") || "",
    });

    setEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = {
        name: formData.name.trim(),
        targetRole: formData.targetRole.trim(),
        education: formData.education.trim(),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const result = await updateProfile(data);

      updateUser(result.user);

      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center sm:text-left">
                      <h1 className="text-3xl font-bold">{user?.name}</h1>

                      <p className="text-gray-500 mt-1">{user?.email}</p>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      onClick={handleEdit}
                      className="bg-black text-white px-5 py-2.5 rounded-lg font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {success && (
                <div className="bg-green-100 text-green-700 rounded-xl p-4 mb-6">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6">
                  {error}
                </div>
              )}

              {/* Profile Information */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6">Profile Information</h2>

                {!editing ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Target Role
                        </p>

                        <p className="font-semibold">
                          {user?.targetRole || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Education</p>

                        <p className="font-semibold">
                          {user?.education || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-sm text-gray-500 mb-3">Skills</p>

                      <div className="flex flex-wrap gap-2">
                        {user?.skills?.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No skills added</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-2">
                        Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>

                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-500"
                      />

                      <p className="text-xs text-gray-400 mt-1">
                        Email cannot be changed.
                      </p>
                    </div>

                    {/* Target Role */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-2">
                        Target Role
                      </label>

                      <input
                        type="text"
                        name="targetRole"
                        value={formData.targetRole}
                        onChange={handleChange}
                        placeholder="Software Developer"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Education */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium mb-2">
                        Education
                      </label>

                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="MCA"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Skills
                      </label>

                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="C++, React, Node.js"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />

                      <p className="text-xs text-gray-400 mt-1">
                        Separate skills with commas.
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="border border-gray-300 px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Profile;
