// WorkerDetailsModal.tsx
import Image from 'next/image';
import React from 'react';

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
        onTimeDelivery: number;
    };
    avatar?: string;
    salary?: number;
    about?: string;
}

type WorkerDetailsModalProps = {
  worker: Worker | null;
  onClose: () => void;
};

const WorkerDetailsModal: React.FC<WorkerDetailsModalProps> = ({ worker, onClose }) => {
  if (!worker) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{worker.name}</h2>
        {worker.avatar && (
          <Image src={worker.avatar} alt={`${worker.name}'s Avatar`} className="w-16 h-16 rounded-full mb-4" />
        )}
        <p><strong>Employee ID:</strong> {worker.employeeId}</p>
        <p><strong>Department:</strong> {worker.department || 'N/A'}</p>
        <p><strong>Role:</strong> {worker.role || 'N/A'}</p>
        <p><strong>Status:</strong> {worker.status || 'Active'}</p>
        {worker.salary && <p><strong>Salary:</strong> ${worker.salary.toLocaleString()}</p>}
        {worker.about && <p className="mt-2"><strong>About:</strong> {worker.about}</p>}
        {worker.skills && (
          <p className="mt-2">
            <strong>Skills:</strong> {worker.skills.join(', ')}
          </p>
        )}
        {worker.performance && (
          <div className="mt-2">
            <strong>Performance:</strong>
            <ul>
              <li>Rating: {worker.performance.rating}</li>
              <li>Completed Tasks: {worker.performance.completedTasks}</li>
              <li>On-Time Delivery: {worker.performance.onTimeDelivery}%</li>
            </ul>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailsModal;