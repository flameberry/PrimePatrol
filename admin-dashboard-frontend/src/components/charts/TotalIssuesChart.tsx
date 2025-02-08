import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TotalIssuesChart = () => {
  const data = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'In App',
        data: [50, 70, 90, 30, 60, 70, 80],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Social Media',
        data: [30, 60, 80, 20, 40, 50, 70],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Explicitly type the position to a constant
      },
      title: {
        display: true,
        text: 'Total Issues',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days of the Week', // Label for x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Issues', // Label for y-axis
        },
      },
    },
  } as const; // Use `as const` to enforce type inference

  return <Bar data={data} options={options} />;
};

export default TotalIssuesChart;
