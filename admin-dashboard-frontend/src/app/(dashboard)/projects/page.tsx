// ProjectsPage.tsx
"use client";

import Column from "@/components/projects/Column";
import React, { useState, useEffect } from "react";

interface Incident {
    id: number;
    title: string;
    content: string;
    imageUrl?: string;
    status?: 'active' | 'resolved';
    timestamp?: string;
}

interface ColumnData {
    title: string;
    color: string;
    incidents: Incident[];
}

const ProjectsPage: React.FC = () => {
    const [columns, setColumns] = useState<Record<string, ColumnData>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIncidentsData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:3000/posts");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("The data is: ", data);
            
            
            // Transform the data into our column structure
            const formattedData: Record<string, ColumnData> = {
                active: {
                    title: "Active Incidents",
                    color: "bg-red-200",
                    incidents: data.filter((incident: Incident) => 
                        incident.status !== 'resolved'
                    )
                },
                resolved: {
                    title: "Resolved Incidents",
                    color: "bg-green-200",
                    incidents: data.filter((incident: Incident) => 
                        incident.status === 'resolved'
                    )
                }
            };

            setColumns(formattedData);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load incidents. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidentsData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={fetchIncidentsData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4">
            {Object.keys(columns).length > 0 ? (
                Object.entries(columns).map(([key, column]) => (
                    <Column
                        key={key}
                        title={column.title}
                        incidents={column.incidents}
                        color={column.color}
                    />
                ))
            ) : (
                <div className="w-full text-center text-gray-500 py-8">
                    No incidents reported.
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;