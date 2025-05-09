import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function Charts() {
  const [ratingData, setRatingData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/feedback-summary")
      .then(res => {
        console.log("API Response:", res.data);
        setRatingData(res.data.average_rating || []);
        const sentimentList = Object.entries(res.data.sentiment_distribution || {}).map(([name, value]) => ({
          name,
          value
        }));
        setSentimentData(sentimentList);
        setTrendData(res.data.sentiment_trend || []);
        setKeywordData(res.data.common_words || []);
        setRadarData(res.data.radar_data || []);
        
        // Extract unique categories from radar data
        if (res.data.radar_data && res.data.radar_data.length > 0) {
          const uniqueCategories = [...new Set(res.data.radar_data.map(item => item.name))];
          setCategories(uniqueCategories);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategory("");
    
    // Reload original data
    setLoading(true);
    axios.get("http://127.0.0.1:8000/feedback-summary")
      .then(res => {
        console.log("API Response:", res.data);
        setRatingData(res.data.average_rating || []);
        const sentimentList = Object.entries(res.data.sentiment_distribution || {}).map(([name, value]) => ({
          name,
          value
        }));
        setSentimentData(sentimentList);
        setTrendData(res.data.sentiment_trend || []);
        setKeywordData(res.data.common_words || []);
        setRadarData(res.data.radar_data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  };

  // Handle Filters and Fetch Filtered Data
  const handleFilterSubmit = () => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/filtered-feedback", {
      params: {
        start: startDate,
        end: endDate,
        category: category,
      }
    })
    .then(res => {
      console.log("Filtered API Response:", res.data);
      setRatingData(res.data.average_rating || []);
      const sentimentList = Object.entries(res.data.sentiment_distribution || {}).map(([name, value]) => ({
        name,
        value
      }));
      setSentimentData(sentimentList);
      setTrendData(res.data.sentiment_trend || []);
      setKeywordData(res.data.common_words || []);
      setRadarData(res.data.radar_data || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching filtered data:", err);
      setError("Failed to load filtered data");
      setLoading(false);
    });
  };

  if (loading) return <div className="p-10 text-center">Loading charts...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-10 p-4">
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Dashboard Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>
        
        {/* Active Filter Indicators */}
        {(startDate || endDate || category) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {startDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                From: {new Date(startDate).toLocaleDateString()}
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                To: {new Date(endDate).toLocaleDateString()}
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Category: {category}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Sentiment Distribution</h2>
        {sentimentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={sentimentData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={100} 
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-300px">
            <p className="text-gray-500">No sentiment data available</p>
          </div>
        )}
      </div>

      {/* Bar Chart for Product Ratings */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Average Rating per Product</h2>
        {ratingData && ratingData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No rating data available</p>
          </div>
        )}
      </div>

      {/* Line Chart for Sentiment Over Time */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Sentiment Trend Over Time</h2>
        {trendData && trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No trend data available</p>
          </div>
        )}
      </div>

      {/* Bar Chart for Most Common Keywords */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Most Common Feedback Keywords</h2>
        {keywordData && keywordData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="word" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No keyword data available</p>
          </div>
        )}
      </div>

      {/* Radar Chart for Average Sentiment by Category */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Average Sentiment by Category</h2>
        {radarData && radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart outerRadius={90} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis domain={[-1, 1]} />
              <Radar name="Sentiment" dataKey="sentiment" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No category sentiment data available</p>
          </div>
        )}
      </div>
    </div>
  );
}