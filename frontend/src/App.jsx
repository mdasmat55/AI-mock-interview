import { BrowserRouter, Routes, Route } from "react-router-dom";

import InterviewSetup from "./pages/interview/InterviewSetup";
import Interview from "./pages/interview/Interview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<h1>AI Interview Platform</h1>}
        />

        <Route
          path="/interview/setup"
          element={<InterviewSetup />}
        />

        <Route
          path="/interview/:interviewId/start"
          element={<Interview />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;