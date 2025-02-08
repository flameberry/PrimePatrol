"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from 'html2canvas';
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
    ["Total Posts Created", "95"],
    ["Issues Initiated", "300"],
    ["Issues Resolved", "5"],
    ["Work In-progress", "8"],
  ];
  
  autoTable(doc, {
    startY: 85,
    head: [["Metric", "Value"]],
    body: tableData,
    margin: { left: 40 },
  });

  // Add margin after the table
  let yOffset = doc.lastAutoTable.finalY + 60; // Add extra margin after table

  // Function to capture and add chart images (two per row)
  const addTwoChartImages = async (
    chartRef1: React.RefObject<HTMLDivElement>, 
    title1: string, 
    chartRef2: React.RefObject<HTMLDivElement>, 
    title2: string
  ) => {
    if (chartRef1.current && chartRef2.current) {
      const canvas1 = await html2canvas(chartRef1.current);
      const canvas2 = await html2canvas(chartRef2.current);

      const imgData1 = canvas1.toDataURL('image/png');
      const imgData2 = canvas2.toDataURL('image/png');

      doc.setFontSize(14);
      doc.text(title1, 40, yOffset);
      doc.addImage(imgData1, 'PNG', 40, yOffset + 10, 240, 120); // First chart

      doc.text(title2, 300, yOffset);
      doc.addImage(imgData2, 'PNG', 300, yOffset + 10, 240, 120); // Second chart

      // Add margin after the charts
      yOffset += 150; // Increase Y offset for the next row to include margin
    }
  };

  // Add charts (two per row)
  await addTwoChartImages(totalIssuesChartRef, "Total Issues", complaintTrackerRef, "Complaint Tracker");
  await addTwoChartImages(problemsFacedChartRef, "Problems Faced", totalIssuesChartRef, "Total Issues Again"); // You can replace with other charts

  // Final margin before saving the PDF
  yOffset += 60; // Additional margin before saving, if needed

  // Save the PDF
  doc.save("dashboard-report.pdf");
};


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Today's Issues Reported</h2>
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
          amount={95}
          bgColor="bg-red-100"
          icon="chart-bar"
        />
        <DataCard
          name="Issues Initiated"
          amount={300}
          bgColor="bg-yellow-100"
          icon="clipboard-list"
        />
        <DataCard
          name="Issues Resolved"
          amount={5}
          bgColor="bg-green-100"
          icon="check-circle"
        />
        <DataCard
          name="Work In-progress"
          amount={8}
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
