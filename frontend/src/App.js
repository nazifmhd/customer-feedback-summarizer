import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <header className="bg-white shadow-lg">
          <div className="container mx-auto p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 md:mb-0">
              🧠 AI Feedback Analyzer
            </h1>
            
            <nav className="flex flex-wrap gap-2">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`
                }
                end
              >
                📋 Feedback
              </NavLink>
              <NavLink 
                to="/charts" 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive 
                      ? "bg-purple-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                📊 Analytics
              </NavLink>
              <NavLink 
                to="/summary" 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                📝 Summary
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard view="table" />} />
            <Route path="/charts" element={<Dashboard view="charts" />} />
            <Route path="/summary" element={<Dashboard view="summary" />} />
          </Routes>
        </main>
        
        <footer className="container mx-auto p-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} AI Feedback Summarizer • All rights reserved
        </footer>
      </div>
    </Router>
  );
}