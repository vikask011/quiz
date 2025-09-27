import "./App.css";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Assessment from "./pages/assessment";
import Auth from "./pages/auth";
import Practice from "./pages/practice";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/user/auth" element={<Auth />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/practice" element={<Practice />} />
    </Routes>
  );
}

export default App;
