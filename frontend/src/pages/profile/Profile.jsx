import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">
                {user?.name}
              </h1>

              <p className="text-gray-500 mt-1">
                {user?.email}
              </p>
            </div>

          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          <h2 className="text-xl font-bold mb-6">
            Profile Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Target Role */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Target Role
              </p>

              <p className="font-semibold">
                {user?.targetRole || "Not specified"}
              </p>
            </div>

            {/* Education */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Education
              </p>

              <p className="font-semibold">
                {user?.education || "Not specified"}
              </p>
            </div>

          </div>

          {/* Skills */}
          <div className="mt-8">

            <p className="text-sm text-gray-500 mb-3">
              Skills
            </p>

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
                <p className="text-gray-500">
                  No skills added
                </p>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;