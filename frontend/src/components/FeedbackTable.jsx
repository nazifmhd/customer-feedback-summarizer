import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FeedbackTable() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/feedback")
      .then(res => setFeedback(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {feedback[0] && Object.keys(feedback[0]).map((key, i) => (
              <th key={i} className="px-4 py-2 border">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {feedback.map((item, idx) => (
            <tr key={idx} className="border-t">
              {Object.values(item).map((value, i) => (
                <td key={i} className="px-4 py-2 border">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
