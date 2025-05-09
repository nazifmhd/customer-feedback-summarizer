import React from "react";
import FeedbackTable from "../components/FeedbackTable";
import Charts from "../components/Charts";
import Summary from "../components/Summary";

export default function Dashboard({ view }) {
  const renderDashboardTitle = () => {
    switch(view) {
      case "table":
        return {
          title: "Feedback Explorer",
          description: "Review and analyze all customer feedback in one place"
        };
      case "charts":
        return {
          title: "Visual Analytics",
          description: "Understand your feedback data through interactive charts"
        };
      case "summary":
        return {
          title: "AI Summary",
          description: "Get intelligent insights from your feedback data"
        };
      default:
        return {
          title: "Dashboard",
          description: "Customer Feedback Analysis"
        };
    }
  };
  
  const { title, description } = renderDashboardTitle();
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      
      {view === "table" && <FeedbackTable />}
      {view === "charts" && <Charts />}
      {view === "summary" && <Summary />}
    </div>
  );
}