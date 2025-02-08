import React from "react";
import { Chart as ChartJS, ArcElement, ChartData, ChartOptions, Plugin } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, ChartDataLabels);

interface PieChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}

const ProblemsFacedChart: React.FC = () => {
  const data: ChartData<"pie"> = {
    labels: ['Garbage Accumulation', 'Industrial', 'Water Problem', 'Flash Flood'],
    datasets: [
      {
        data: [20, 15, 25, 40],
        backgroundColor: ['#563dff', '#ff4e42', '#2d6ff7', '#ffaf42'],
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      datalabels: {
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((acc: number, curr: number) => acc + curr, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: '350px', width: '350px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ProblemsFacedChart;