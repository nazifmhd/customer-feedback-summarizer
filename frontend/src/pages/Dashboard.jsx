import React from "react";
import FeedbackTable from "../components/FeedbackTable";
import Charts from "../components/Charts";
import Summary from "../components/Summary";

export default function Dashboard({ view }) {
  return (
    <div>
      {view === "table" && <FeedbackTable />}
      {view === "charts" && <Charts />}
      {view === "summary" && <Summary />}
    </div>
  );
}
