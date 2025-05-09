import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">🧠 AI Feedback Summarizer</h1>
        <nav className="flex gap-4 mb-6">
          <NavLink to="/" className="text-blue-600 font-semibold" end>📋 Feedback Table</NavLink>
          <NavLink to="/charts" className="text-blue-600 font-semibold">📊 Charts</NavLink>
          <NavLink to="/summary" className="text-blue-600 font-semibold">📝 Summary</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard view="table" />} />
          <Route path="/charts" element={<Dashboard view="charts" />} />
          <Route path="/summary" element={<Dashboard view="summary" />} />
        </Routes>
      </div>
    </Router>
  );
}
