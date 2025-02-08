import { Reply } from "@mui/icons-material";
import React from "react";

// Define the Post type (updated from Task)
interface Post {
    name: string;
    description: string;
    active: boolean;
    twitterUrl?: string; // Optional Twitter URL
}

// Define the props for TaskCard
interface TaskCardProps {
    post: Post; // Updated to expect 'post' instead of 'task'
}

const TaskCard: React.FC<TaskCardProps> = ({ post }) => {
    return (
        <div className="w-64 min-w-[256px] h-64 bg-white rounded-lg shadow-lg overflow-hidden relative hover:shadow-xl transition-shadow duration-300">
            {/* No Image rendering anymore since it's not part of the updated structure */}
            <div className="p-3">
                <h3 className="font-bold text-lg text-gray-900">{post.name}</h3>
                <p className="text-sm text-gray-600">{post.description}</p>
                <p className="text-sm text-gray-500 italic">{post.active ? "Active" : "Inactive"}</p> {/* Display active status */}
            </div>

            {post.twitterUrl && (
                <a
                    href={post.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                >
                    <Reply style={{ fontSize: 12 }} />
                </a>
            )}
        </div>
    );
};

export default TaskCard;
