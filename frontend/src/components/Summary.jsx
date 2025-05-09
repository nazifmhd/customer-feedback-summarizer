import React, { useState } from "react";
import axios from "axios";

export default function Summary() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarizeFeedback = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/generate-summary");
      if (data.error) {
        setError(data.error);
      } else {
        setSummary(data.summary);
      }
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">📝 Feedback Summary</h2>

      <button
        onClick={handleSummarizeFeedback}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? "Summarizing…" : "Summarize Feedback"}
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-line">
          {summary}
        </div>
      )}
    </div>
  );
}
