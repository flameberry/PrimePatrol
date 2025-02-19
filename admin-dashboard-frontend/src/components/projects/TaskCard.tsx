import Image from "next/image";
import React from "react";

interface Incident {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  status?: "active" | "resolved" | "pending";
  timestamp?: string;
}

interface IncidentCardProps {
  incident: Incident;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      {incident.imageUrl && (
        <div className="relative w-full h-auto">
          <Image
            src={incident.imageUrl}
            alt={incident.title}
            width={0} // Auto width
            height={0} // Auto height
            sizes="100vw" // Responsive images
            className="w-full h-auto object-cover rounded-t-lg"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
        <p className="text-gray-600 mb-2">{incident.content}</p>

        {incident.status === "pending" ? (
          <div className="border-l-4 border-yellow-500 p-3 bg-yellow-50 rounded">
            <span className="text-yellow-800 font-medium">Pending Approval</span>
            <p className="text-sm text-yellow-700">
              This incident is awaiting review.
            </p>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span
              className={`px-2 py-1 rounded text-sm ${
                incident.status === "resolved"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {incident.status?.charAt(0).toUpperCase() + incident.status?.slice(1) || "Active"}
            </span>

            {incident.timestamp && (
              <span className="text-sm text-gray-500">
                {new Date(incident.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
