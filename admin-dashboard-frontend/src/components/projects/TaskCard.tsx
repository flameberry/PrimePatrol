import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface Worker {
    _id: string;
    name: string;
    employeeId: string;
    activities: string[]; // Array of activity IDs
    assignedPosts: string[]; // Array of post IDs
}

interface Incident {
    _id: string;
    userId: string;
    title: string;
    content: string;
    imageUrl?: string;
    status: "Active" | "resolved" | "pending";
    assignedWorkers: string[]; // Array of worker IDs
    workerActivities: string[];
    createdAt: string;
    updatedAt: string;
}

interface IncidentCardProps {
    incident: Incident;
    onStatusChange: (id: string, newStatus: "Active" | "resolved" | "pending") => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onStatusChange }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
    const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
    const [assignedWorkers, setAssignedWorkers] = useState<Worker[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all available workers for the modal
    const fetchAvailableWorkers = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/workers');
            if (!response.ok) throw new Error('Failed to fetch workers');
            const workers = await response.json();
            setAvailableWorkers(workers);
        } catch (error) {
            console.error('Error fetching available workers:', error);
        }
    }, []);

    // Fetch only assigned workers for display
    const fetchAssignedWorkers = useCallback(async () => {
        if (!incident.assignedWorkers || incident.assignedWorkers.length === 0) {
            setAssignedWorkers([]);
            return;
        }

        try {
            // Fetch workers by their IDs
            const workerIds = incident.assignedWorkers.join(',');
            const response = await fetch(`http://localhost:3001/api/v1/workers?ids=${workerIds}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch assigned workers');
            }

            const workers = await response.json();
            setAssignedWorkers(workers);
        } catch (error) {
            console.error('Error fetching assigned workers:', error);
        }
    }, [incident.assignedWorkers]);

    // Fetch assigned workers when incident changes
    useEffect(() => {
        fetchAssignedWorkers();
    }, [incident._id, fetchAssignedWorkers]);

    // Fetch available workers when modal opens
    useEffect(() => {
        if (showModal) {
            fetchAvailableWorkers();
            // Pre-select currently assigned workers
            setSelectedWorkers(incident.assignedWorkers);
        }
    }, [showModal, fetchAvailableWorkers, incident.assignedWorkers]);

    const handleClose = useCallback(() => {
        setShowModal(false);
        setSelectedWorkers([]);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showModal, handleClose]);

    const handleWorkerSelection = (workerId: string) => {
        setSelectedWorkers(prev =>
            prev.includes(workerId)
                ? prev.filter(id => id !== workerId) // Deselect worker
                : [...prev, workerId] // Select worker
        );
    };

    const handleAssignWorkers = async () => {
        if (selectedWorkers.length === 0) return;
      
        setIsLoading(true);
        try {
          // Update the incident with the new list of assigned workers
          const incidentResponse = await fetch(`http://localhost:3002/api/v1/posts/${incident._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "Active",
              assignedWorkers: selectedWorkers, // Replace with the new list
            }),
          });
      
          if (!incidentResponse.ok) {
            throw new Error("Failed to update incident");
          }
      
          // Update each worker's assignedPosts array and set their status to "active"
          await Promise.all(selectedWorkers.map(async (workerId) => {
            const updateWorkerResponse = await fetch(`http://localhost:3001/api/v1/workers/${workerId}/assign-post`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                assignedPosts: [incident._id], // Append the postId
                status: "active", // Set the worker's status to "active"
              }),
            });
      
            if (!updateWorkerResponse.ok) {
              throw new Error(`Failed to update worker ${workerId}`);
            }
          }));
      
          // Refresh assigned workers display
          await fetchAssignedWorkers();
      
          // Notify parent component of status change
          onStatusChange(incident._id, "Active");
      
          // Close the modal
          handleClose();
        } catch (error) {
          console.error("Error updating assignments:", error);
        } finally {
          setIsLoading(false);
        }
      };

    const getStatusConfig = (status: Incident['status']) => {
        const configs = {
            pending: {
                borderColor: 'border-yellow-500',
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-800',
                descColor: 'text-yellow-700',
                title: 'Pending Approval',
                description: 'This incident is awaiting review.'
            },
            Active: {
                borderColor: 'border-red-500',
                bgColor: 'bg-red-50',
                textColor: 'text-red-800',
                descColor: 'text-red-700',
                title: 'Active Incident',
                description: 'This incident is currently being addressed.'
            },
            resolved: {
                borderColor: 'border-green-500',
                bgColor: 'bg-green-50',
                textColor: 'text-green-800',
                descColor: 'text-green-700',
                title: 'Resolved',
                description: 'This incident has been resolved successfully.'
            }
        };
        return configs[status];
    };

    const statusConfig = getStatusConfig(incident.status);

    return (
        <div className="group">
            <div
                className="border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden transform hover:-translate-y-1"
                onClick={() => incident.status === "pending" && setShowModal(true)}
            >
                {incident.imageUrl && (
                    <div className="relative w-full h-48">
                        <Image
                            src={incident.imageUrl}
                            alt={incident.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{incident.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{incident.content}</p>

                    <div className={`border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} p-4 rounded-r mb-4`}>
                        <span className={`${statusConfig.textColor} font-medium`}>
                            {statusConfig.title}
                        </span>
                        <p className={`mt-1 text-sm ${statusConfig.descColor}`}>
                            {statusConfig.description}
                        </p>
                    </div>

                    {incident.assignedWorkers && incident.assignedWorkers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Workers:</h4>
                            <div className="flex flex-wrap gap-2">
                                {assignedWorkers.map((worker) => (
                                    <span
                                        key={worker._id}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {worker.name || 'Unknown Worker'}
                                    </span>
                                ))}
                                {assignedWorkers.length === 0 && incident.assignedWorkers.length > 0 && (
                                    <span className="text-gray-500">Loading worker details...</span>
                                )}
                            </div>
                        </div>
                    )}

                    {incident.createdAt && (
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Initiated:</span>
                            <span>{new Date(incident.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                >
                    <div className="bg-white rounded-xl shadow-xl w-96 max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Assign Workers</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <div className="space-y-2">
                                {availableWorkers.map(worker => (
                                    <label
                                        key={worker._id}
                                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedWorkers.includes(worker._id)}
                                            onChange={() => handleWorkerSelection(worker._id)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{worker.name}</span>
                                        <span className="text-gray-400 text-sm">{worker.employeeId}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    className={`flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium
                                        hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                        disabled:opacity-50 disabled:cursor-not-allowed transition-all
                                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleAssignWorkers}
                                    disabled={selectedWorkers.length === 0 || isLoading}
                                >
                                    {isLoading ? 'Assigning...' : 'Assign Selected'}
                                </button>
                                <button
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium
                                        hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                        transition-all"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentCard;