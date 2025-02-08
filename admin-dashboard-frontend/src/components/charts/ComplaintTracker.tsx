import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register the necessary components for the Line chart
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ComplaintTracker = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Issues Solved',
        data: [10, 40, 30, 60, 50, 70, 60],
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'Issues Raised',
        data: [20, 50, 60, 30, 70, 80, 90],
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Cast to the specific literal type
      },
      title: {
        display: true,
        text: 'Complaint Tracker',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Issues',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ComplaintTracker;
