import { BrowserRouter, Routes, Route } from "react-router-dom";

import InterviewSetup from "./pages/interview/InterviewSetup";
import Interview from "./pages/interview/Interview";
import InterviewReport from "./pages/interview/InterviewReport";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold">AI Interview Platform</h1>

                <p className="text-gray-500 mt-2">
                  Practice interviews with AI
                </p>
              </div>
            </div>
          }
        />

        {/* Authentication */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/interview/setup" element={<InterviewSetup />} />

          <Route path="/interview/:interviewId/start" element={<Interview />} />

          <Route
            path="/interview/:interviewId/report"
            element={<InterviewReport />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
