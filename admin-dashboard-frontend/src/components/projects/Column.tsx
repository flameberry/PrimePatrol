import React, { useState } from "react";
import IncidentCard from "./TaskCard";

interface Incident {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  status: "Active" | "resolved" | "pending"; // Ensuring lowercase values for consistency
  timestamp?: string;
}

interface BoardProps {
  incidents: Incident[];
}

const Board: React.FC<BoardProps> = ({ incidents }) => {
  const [sortBy, setSortBy] = useState<"name" | "date">("name"); // Sorting state
  const [searchQuery, setSearchQuery] = useState(""); // Search state

  // Filter incidents based on search query
  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort incidents based on the selected criteria
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title); // Sort by name (title)
    } else if (sortBy === "date" && a.timestamp && b.timestamp) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); // Sort by date
    }
    return 0;
  });

  // Filter incidents based on status
  const pendingIncidents = sortedIncidents.filter(
    (incident) => incident.status === "pending"
  );
  const activeIncidents = sortedIncidents.filter(
    (incident) => incident.status === "Active"
  );
  const resolvedIncidents = sortedIncidents.filter(
    (incident) => incident.status === "resolved"
  );

  // Only render columns that have incidents
  const columns = [
    {
      title: "Pending",
      incidents: pendingIncidents,
      color: "bg-yellow-50",
      text: "text-yellow-700",
    },
    {
      title: "Active",
      incidents: activeIncidents,
      color: "bg-red-50",
      text: "text-red-700",
    },
    {
      title: "Resolved",
      incidents: resolvedIncidents,
      color: "bg-green-50",
      text: "text-green-700",
    },
  ].filter((column) => column.incidents.length > 0); // Removes empty columns

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Search and Sorting Controls */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="w-full md:w-1/3">
          <label htmlFor="search" className="sr-only">
            Search incidents...
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="w-full md:w-1/3 flex justify-end">
          <label htmlFor="sort" className="mr-2 text-gray-700 font-medium">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "date")}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-wrap justify-start gap-6">
        {columns.map((col) => (
          <Column
            key={col.title}
            title={col.title}
            incidents={col.incidents}
            color={col.color}
            text={col.text}
          />
        ))}
      </div>
    </div>
  );
};

interface ColumnProps {
  title: string;
  incidents: Incident[];
  color: string;
  text: string;
}

const Column: React.FC<ColumnProps> = ({ title, incidents, color, text }) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] bg-white rounded-xl shadow-md overflow-hidden">
      {/* Column Header */}
      <div className={`${color} p-5`}>
        <h2 className={`text-lg font-semibold ${text}`}>{title}</h2>
      </div>

      {/* Incident List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">No incidents found.</div>
        )}
      </div>
    </div>
  );
};

export default Board;
