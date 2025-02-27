"use client";

import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DataCard from "@/components/DataCard";
import ComplaintTracker from "@/components/charts/ComplaintTracker";
import NewsUpdate from "@/components/charts/NewsUpdate";
import ProblemsFacedChart from "@/components/charts/ProblemFaced";
import TotalIssuesChart from "@/components/charts/TotalIssuesChart";

// Extend jsPDF type to include autoTable
interface ExtendedJsPDF extends jsPDF {
  autoTable: typeof autoTable;
}

export default function DashboardPage() {
  // State for fetched data
  const [dashboardData, setDashboardData] = useState({
    totalPosts: 0,
    issuesInitiated: 0,
    issuesResolved: 0,
    workInProgress: 0,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/v1/posts/stats");
        const data = await response.json();
        console.log("the data is: ", data);
        

        setDashboardData({
          totalPosts: data.totalPosts,
          issuesInitiated: data.totalPosts,
          issuesResolved: data.resolvedPosts,
          workInProgress: data.activePosts,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Refs for chart components
  const totalIssuesChartRef = useRef<HTMLDivElement>(null);
  const complaintTrackerRef = useRef<HTMLDivElement>(null);
  const problemsFacedChartRef = useRef<HTMLDivElement>(null);

  const generateReport = async () => {
    const doc = new jsPDF("portrait", "pt", "a4") as ExtendedJsPDF;

    // Add title
    doc.setFontSize(18);
    doc.text("Dashboard Report", 40, 30);

    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 50);

    // Add Data Cards information
    doc.setFontSize(14);
    doc.text("Summary", 40, 80);

    const tableData = [
      ["Total Posts Created", dashboardData.totalPosts.toString()],
      ["Issues Initiated", dashboardData.issuesInitiated.toString()],
      ["Issues Resolved", dashboardData.issuesResolved.toString()],
      ["Work In-progress", dashboardData.workInProgress.toString()],
    ];

    autoTable(doc, {
      startY: 85,
      head: [["Metric", "Value"]],
      body: tableData,
      margin: { left: 40 },
    });

    // Save the PDF
    doc.save("dashboard-report.pdf");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Today&apos;s Issues Reported</h2>
        {/* Export Button */}
        <button
          className="flex items-center px-4 py-2 border border-blue-700 text-blue-700 rounded-md hover:bg-blue-50"
          onClick={generateReport}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Export
        </button>
      </div>

      {/* Data Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard
          name="Total Posts Created"
          amount={dashboardData.totalPosts}
          bgColor="bg-red-100"
          icon="chart-bar"
        />
        <DataCard
          name="Issues Initiated"
          amount={dashboardData.issuesInitiated}
          bgColor="bg-yellow-100"
          icon="clipboard-list"
        />
        <DataCard
          name="Issues Resolved"
          amount={dashboardData.issuesResolved}
          bgColor="bg-green-100"
          icon="check-circle"
        />
        <DataCard
          name="Work In-progress"
          amount={dashboardData.workInProgress}
          bgColor="bg-purple-100"
          icon="users"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {/* Total Issues Chart */}
        <div ref={totalIssuesChartRef} className="lg:col-span-2 p-4 bg-white rounded-lg shadow-md h-full">
          <h3 className="text-lg font-bold mb-4">Total Issues</h3>
          <TotalIssuesChart />
        </div>

        {/* News Update */}
        <div className="p-4 bg-white rounded-lg shadow-md h-full">
          <h3 className="text-lg font-bold mb-4">News Update</h3>
          <NewsUpdate />
        </div>

        {/* Complaint Tracker Chart */}
        <div ref={complaintTrackerRef} className="lg:col-span-2 p-4 bg-white rounded-lg shadow-md h-full">
          <h3 className="text-lg font-bold mb-4">Complaint Tracker</h3>
          <ComplaintTracker />
        </div>

        {/* Problems Faced Chart */}
        <div ref={problemsFacedChartRef} className="p-4 bg-white rounded-lg shadow-md h-full">
          <h3 className="text-lg font-bold mb-4">Problems Faced</h3>
          <ProblemsFacedChart />
        </div>
      </div>
    </div>
  );
}
