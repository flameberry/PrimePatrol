// Column.tsx
import React from "react";
import IncidentCard from "./TaskCard";

interface Incident {
    id: number;
    title: string;
    content: string;
    imageUrl?: string;
    status?: 'active' | 'resolved';
    timestamp?: string;
}

interface ColumnProps {
    title: string;
    incidents: Incident[];
    color?: string;
}

const Column: React.FC<ColumnProps> = ({ title, incidents, color = "bg-gray-200" }) => {
    return (
        <div className="flex-1 min-w-[300px]">
            <div className={`${color} p-4 rounded-t-lg`}>
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            
            <div className="border rounded-b-lg bg-white">
                <div className="p-4 space-y-4">
                    {incidents.length === 0 ? (
                        <NoIncidentsAvailable />
                    ) : (
                        incidents.map((incident) => (
                            <IncidentCard key={incident.id} incident={incident} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const NoIncidentsAvailable = () => (
    <div className="text-center text-gray-500 py-4">
        No incidents in this category.
    </div>
);

export default Column;