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

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/feedback-summary")
      .then(res => {
        setRatingData(res.data.average_rating);
        const sentimentList = Object.entries(res.data.sentiment_distribution).map(([name, value]) => ({
          name,
          value
        }));
        setSentimentData(sentimentList);
        setTrendData(res.data.sentiment_trend);
        setKeywordData(res.data.common_words);
        setRadarData(res.data.radar_data); // Setting radar data here
      });
  }, []);

  // Handle Filters and Fetch Filtered Data
  const handleFilterSubmit = () => {
    axios.get("http://127.0.0.1:8000/filtered-feedback", {
      params: {
        start: startDate,
        end: endDate,
        category: category,
      }
    })
    .then(res => {
      setRatingData(res.data.average_rating);
      const sentimentList = Object.entries(res.data.sentiment_distribution).map(([name, value]) => ({
        name,
        value
      }));
      setSentimentData(sentimentList);
      setTrendData(res.data.sentiment_trend);
      setKeywordData(res.data.common_words);
      setRadarData(res.data.radar_data); // Updating radar data with filtered data
    });
  };

  return (
    <div className="space-y-10 p-4">
      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleFilterSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Sentiment Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={100} label>
              {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart for Product Ratings */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Average Rating per Product</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rating" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart for Sentiment Over Time */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Sentiment Trend Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[-1, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart for Most Common Keywords */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Most Common Feedback Keywords</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={keywordData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="word" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#fb923c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart for Average Sentiment by Category */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Average Sentiment by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart outerRadius={90} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar name="Sentiment" dataKey="sentiment" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
