import React from "react";
import TaskCard from "./TaskCard"; // You can still use the TaskCard component

// Define the props type for Column
interface ColumnProps {
    title: string;
    posts: Post[]; // Updated to posts instead of tasks
    color?: string; // Optional Tailwind CSS background color class
}

// Post type definition (previously Task)
interface Post {
    id: number; // Assuming posts have unique ids
    name: string;
    description: string;
    active: boolean;
}

const Column: React.FC<ColumnProps> = ({ title, posts, color = "bg-gray-200" }) => {

    console.log("Posts: ",posts);
    

    return (
        <div className="w-full p-3">
            <h2 className="text-xl font-bold mb-3">{title}</h2>
            <div className={`rounded-lg p-3 shadow-lg ${color}`}>
                {/* Horizontal scroll area */}
                <div className="flex space-x-3 overflow-x-auto p-2 scrollbar-hide">
                    {posts.length !== 0 ? (
                        <NoPostsAvailable />
                    ) : (
                        posts.map((post) => (
                            <TaskCard key={post.id} post={post} /> // Passing post instead of task
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Component for empty state
const NoPostsAvailable = () => (
    <p className="text-gray-500">No posts available.</p>
);

export default Column;
