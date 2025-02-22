"use client"

import { useState, useEffect, useCallback } from 'react';
import { FileText, Users, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WorkerDetailsModal from '@/components/projects/WorkerDetailsModel';

interface Worker {
    _id: string;
    name: string;
    employeeId: string;
    activities: string[];
    assignedPosts: string[];
    createdAt: string;
    updatedAt: string;
    department?: string;
    role?: string;
    skills?: string[];
    status?: 'active' | 'on_leave' | 'busy';
    performance?: {
        rating: number;
        completedTasks: number;
        onTimeDelivery: number; // Added to match the expected interface
    };
    avatar?: string;
    salary?: number;
    about?: string;
}

interface Post {
    _id: string;
    title: string; // Changed 'name' to 'title' to match the post schema
}

interface Assignment {
    [problemId: string]: {
        workerId: string | null;
        projectTitle: string | null;
        deadline?: string;
        priority?: 'high' | 'medium' | 'low';
    };
}

export default function WorkerAssignmentTable() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [assignments, setAssignments] = useState<Assignment>({});
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'employeeId' | 'status'>('name');

    const fetchPostDetails = async (postId: string): Promise<Post> => {
        try {
            const response = await fetch(`http://localhost:3000/posts/${postId}`);
            if (!response.ok) throw new Error('Failed to fetch post details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching post details:', error);
            return { _id: postId, title: `Project ${postId.slice(0, 5)}` }; // Changed 'name' to 'title'
        }
    };

    const fetchWorkers = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/workers');
            if (!response.ok) throw new Error('Failed to fetch workers');
            const data = await response.json();
            setWorkers(data);

            // Fetch post details for each worker's assignedPosts
            const postDetails: { [postId: string]: Post } = {};
            const postPromises: Promise<void>[] = [];

            for (const worker of data) {
                for (const postId of worker.assignedPosts) {
                    if (!postDetails[postId]) {
                        postPromises.push(
                            fetchPostDetails(postId)
                                .then(post => {
                                    postDetails[postId] = post;
                                })
                        );
                    }
                }
            }

            await Promise.all(postPromises);

            // Initialize assignments after post details are fetched
            const initialAssignments: Assignment = {};
            data.forEach((worker: Worker) => {
                if (worker.assignedPosts.length > 0) {
                    worker.assignedPosts.forEach(postId => {
                        initialAssignments[postId] = {
                            workerId: worker._id,
                            projectTitle: postDetails[postId]?.title || `Project ${postId.slice(0, 5)}`,
                            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                            priority: 'medium'
                        };
                    });
                }
            });
            setAssignments(initialAssignments);

        } catch (error) {
            console.error('Error fetching workers:', error);
        }
    }, []);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const getStatusColor = (status: Worker['status']) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            on_leave: 'bg-yellow-100 text-yellow-800',
            busy: 'bg-red-100 text-red-800'
        };
        return colors[status || 'active'];
    };

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedWorkers = [...filteredWorkers].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'employeeId':
                return a.employeeId.localeCompare(b.employeeId);
            case 'status':
                return (a.status || '').localeCompare(b.status || '');
            default:
                return 0;
        }
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Worker Assignments
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workers..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'employeeId' | 'status')}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="employeeId">Sort by ID</option>
                            <option value="status">Sort by Status</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Worker</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Employee ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Assigned Projects</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedWorkers.map((worker) => (
                                <tr key={worker._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{worker.name}</div>
                                                <div className="text-sm text-gray-500">{worker.department || 'Department N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {worker.employeeId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                                            {worker.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {worker.assignedPosts.length > 0 ? (
                                                worker.assignedPosts.map((postId) => (
                                                    <div key={postId} className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{assignments[postId]?.projectTitle || `Project ${postId.slice(0, 5)}`}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No assigned projects</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedWorker(worker)}
                                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedWorker && (
                    <WorkerDetailsModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
                )}
            </CardContent>
        </Card>
    );
}