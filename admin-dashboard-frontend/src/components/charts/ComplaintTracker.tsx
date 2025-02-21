import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Complaint {
  createdAt: string;
  status: string;
}

const ComplaintTracker: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/posts"); // Replace with actual API URL
        const data: Complaint[] = await response.json();

        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
          "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const monthStats: Record<string, { raised: number; solved: number }> = {};

        data.forEach((item: Complaint) => {
          const date = new Date(item.createdAt);
          const month = monthNames[date.getMonth()];

          if (!monthStats[month]) {
            monthStats[month] = { raised: 0, solved: 0 };
          }

          monthStats[month].raised += 1;
          if (item.status === "resolved") {
            monthStats[month].solved += 1;
          }
        });

        const sortedMonths = monthNames.filter((month) => monthStats[month]);
        const issuesRaised = sortedMonths.map((month) => monthStats[month]?.raised || 0);
        const issuesSolved = sortedMonths.map((month) => monthStats[month]?.solved || 0);

        setChartData({
          labels: sortedMonths,
          datasets: [
            {
              label: "Issues Solved",
              data: issuesSolved,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
            },
            {
              label: "Issues Raised",
              data: issuesRaised,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Complaint Tracker" },
    },
    scales: {
      x: { title: { display: true, text: "Months" } },
      y: { title: { display: true, text: "Number of Issues" } },
    },
  };

  return (
    <div>
      {chartData ? <Line data={chartData} options={options} /> : <p>Loading chart...</p>}
    </div>
  );
};

export default ComplaintTracker;
