// IncidentCard.tsx
import React from "react";

interface Incident {
    id: number;
    title: string;
    content: string;
    imageUrl?: string;
    status?: 'active' | 'resolved';
    timestamp?: string;
}

interface IncidentCardProps {
    incident: Incident;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
    return (
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {incident.imageUrl && (
                <div className="w-full h-48 relative">
                    <img
                        src={incident.imageUrl}
                        alt={incident.title}
                        className="w-full h-full object-cover rounded-t-lg"
                    />
                </div>
            )}
            
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
                <p className="text-gray-600 mb-2">{incident.content}</p>
                
                <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                        incident.status === 'resolved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {incident.status || 'Active'}
                    </span>
                    
                    {incident.timestamp && (
                        <span className="text-sm text-gray-500">
                            {new Date(incident.timestamp).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentCard;