"use client";

import Column from "@/components/projects/Column";
import React, { useState, useEffect } from "react";

// Define the interface for Post (formerly Task)
interface Post {
    id: number;
    name: string;
    description: string;
    active: boolean;
}

// Define the interface for Column
interface ColumnData {
    title: string;
    color: string;
    posts: Post[];
}

const ProjectsPage: React.FC = () => {
    // State for storing the fetched columns data
    const [columns, setColumns] = useState<ColumnData[]>([]);

    // State for loading and error handling
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    useEffect(() => {
        const fetchColumnsData = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/posts");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Data fetched:", data);  // Log the data to inspect its structure

                // Default posts to empty array if not present
                const formattedData = data.map((column: any) => ({
                    title: column.title,
                    color: column.color,
                    posts: column.posts || [], // Fallback to empty array if posts are undefined
                }));

                setColumns(formattedData);
            } catch (err) {
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchColumnsData();
    }, []); // Empty dependency array to only fetch once on mount

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="flex flex-col p-5 space-y-4">
            {/* Columns */}
            {columns.map((column, index) => (
                <Column key={index} title={column.title} posts={column.posts} color={column.color} />
            ))}
        </div>
    );
};

export default ProjectsPage;
