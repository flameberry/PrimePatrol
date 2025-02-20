import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Issue {
  createdAt: string;
}

const TotalIssuesChart = () => {
  const [chartData, setChartData] = useState({
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'In App',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Social Media',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/posts");
      const issues: Issue[] = await response.json();
      
      const dayCounts: Record<string, number> = { 
        Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, 
        Friday: 0, Saturday: 0, Sunday: 0 
      };
      
      issues.forEach((issue) => {
        const dayName = new Date(issue.createdAt).toLocaleDateString("en-US", { weekday: "long" });
        if (dayCounts[dayName as keyof typeof dayCounts] !== undefined) {
          dayCounts[dayName as keyof typeof dayCounts] += 1;
        }
      });

      setChartData({
        labels: Object.keys(dayCounts),
        datasets: [
          {
            label: 'In App',
            data: Object.values(dayCounts),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
          },
          {
            label: 'Social Media',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
          },
        ],
      });
    };

    fetchData();
  }, []);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Total Issues",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days of the Week",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Issues",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default TotalIssuesChart;
