import React, { useState } from "react";
import axios from "axios";

export default function Summary() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryType, setSummaryType] = useState("general");

   const handleSummarizeFeedback = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");
  
    try {
      const { data } = await axios.post("http://127.0.0.1:8000/generate-summary", {
        type: summaryType
      });
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="text-xl font-bold text-white">AI-Generated Feedback Summary</h2>
        <p className="text-indigo-100 mt-1">Get intelligent insights from your feedback data</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-indigo-50 p-4 rounded-xl">
          <h3 className="text-lg font-medium text-indigo-900 mb-2">Summary Options</h3>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSummaryType("general")}
              className={`px-4 py-2 rounded-full transition-all ${
                summaryType === "general" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              General
            </button>
            
            <button
              onClick={() => setSummaryType("actionable")}
              className={`px-4 py-2 rounded-full transition-all ${
                summaryType === "actionable" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              Actionable Insights
            </button>
            
            <button
              onClick={() => setSummaryType("sentiment")}
              className={`px-4 py-2 rounded-full transition-all ${
                summaryType === "sentiment" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              Sentiment Analysis
            </button>
          </div>
        </div>

        <button
          onClick={handleSummarizeFeedback}
          className={`w-full py-3 px-4 rounded-lg mb-6 flex items-center justify-center font-medium text-white transition-all ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Summary...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Generate Summary
            </>
          )}
        </button>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {summary ? (
          <div className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Summary Report
            </h3>
            <div className="prose max-w-none text-gray-800 whitespace-pre-line">
              {summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        ) : !isLoading && (
          <div className="text-center py-10 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p>Click "Generate Summary" to analyze your feedback data</p>
          </div>
        )}
      </div>
    </div>
  );
}