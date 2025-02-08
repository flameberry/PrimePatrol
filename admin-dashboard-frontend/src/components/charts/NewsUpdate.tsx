import React from "react";
import {Chart, ArcElement} from 'chart.js'
Chart.register(ArcElement);

const NewsUpdate = () => {
  const updates = [
    { area: 'Latur', progress: 80, color: 'bg-orange-500' },
    { area: 'Kolhapur', progress: 60, color: 'bg-green-500' },
    { area: 'Chembur', progress: 40, color: 'bg-purple-500' },
    { area: 'Thane', progress: 70, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">News Update</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>#</th>
            <th>Area</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{update.area}</td>
              <td>
                <div className="relative w-full bg-gray-200 h-4 rounded">
                  <div
                    className={`absolute h-full rounded ${update.color}`}
                    style={{ width: `${update.progress}%` }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewsUpdate;
