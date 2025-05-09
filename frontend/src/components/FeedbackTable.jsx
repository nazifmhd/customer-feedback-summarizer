import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FeedbackTable() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  useEffect(() => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/feedback")
      .then(res => {
        setFeedback(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load feedback data");
        setLoading(false);
      });
  }, []);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sort and filter data
  const getSortedData = () => {
    let sortableItems = [...feedback];
    
    // Filter by search term
    if (searchTerm) {
      sortableItems = sortableItems.filter(item => 
        Object.values(item).some(val => 
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Sort by selected column
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  };
  
  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return "bg-gray-100";
    
    const value = parseFloat(sentiment);
    if (value > 0.3) return "bg-green-100 text-green-800";
    if (value < -0.3) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-center bg-red-50 p-6 rounded-lg text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-lg font-bold">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="text-xl font-bold text-white">Customer Feedback</h2>
        <p className="text-blue-100 mt-1">Browse and analyze customer responses</p>
        
        <div className="mt-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search feedback..."
            className="py-2 pl-10 pr-4 w-full md:w-64 rounded-full bg-blue-700 text-white placeholder-blue-300 border-none focus:outline-none focus:ring-2 focus:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {feedback.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(feedback[0]).map((key, i) => (
                  <th 
                    key={i} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort(key)}
                  >
                    <div className="flex items-center">
                      {key}
                      {sortConfig.key === key && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedData().map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.entries(item).map(([key, value], i) => (
                    <td 
                      key={i} 
                      className={`px-6 py-4 whitespace-nowrap text-sm ${key === 'sentiment' ? getSentimentColor(value) : ''}`}
                    >
                      {key === 'rating' ? (
                        <div className="flex items-center">
                          {"★".repeat(Math.round(parseFloat(value)))}
                          {"☆".repeat(5 - Math.round(parseFloat(value)))}
                          <span className="ml-2 text-gray-600">{value}</span>
                        </div>
                      ) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">No feedback data available.</div>
        )}
      </div>
    </div>
  );
}