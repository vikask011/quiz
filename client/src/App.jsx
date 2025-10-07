import "./App.css";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Assessment from "./pages/assessment";
import Auth from "./pages/auth";
import Practice from "./pages/practice";
import ProtectedRoute from "./pages/ProtectedRoute";
import Logout from "./pages/Logout.jsx";
import Profile from "./pages/Profile.jsx";
import Results from "./pages/Results.jsx";
import ResultDetail from "./pages/ResultDetail.jsx";
import MixedPractice from "./pages/MixedPractice.jsx";
import DifficultPractice from "./pages/DifficultPractice.jsx";
import AssessmentSelection from "./pages/AssessmentSelection.jsx";
import AdaptiveAssess from "./pages/AdaptiveAssess.jsx";

function App() {
  return (
    <Routes>
      {/* Auth Page (always accessible) */}
      <Route path="/user/auth" element={<Auth />} />
      <Route path="/logout" element={<Logout />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/selection"
        element={
          <ProtectedRoute>
            <AssessmentSelection />
            {/* <Assessment /> */}
          </ProtectedRoute>
        }
      />
      <Route
        path="/traditional/assessment"
        element={
          <ProtectedRoute>
            <Assessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adaptive/assessment"
        element={
          <ProtectedRoute>
            <AdaptiveAssess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <ProtectedRoute>
            <ResultDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mixedpractice"
        element={
          <ProtectedRoute>
            <MixedPractice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/difficultpractice"
        element={
          <ProtectedRoute>
            <DifficultPractice />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
