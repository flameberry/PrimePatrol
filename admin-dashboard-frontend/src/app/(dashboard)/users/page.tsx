'use client';

import { useState } from 'react';
import WorkerDetailsModal from '@/components/projects/WorkerDetailsModel';

// Types
type Worker = {
  id: number;
  name: string;
  avatar: string;
  salary: number; // Added salary field
  about: string; // Added about field
};

type Problem = {
  id: number;
  title: string;
};

type Assignment = {
  [problemId: number]: { workerId: number | null; projectTitle: string | null }; // Map problemId to workerId and project title
};

// Mock data (replace with actual data fetching in a real application)
const workers: Worker[] = [
  { id: 1, name: 'Alice Johnson', avatar: '/api/placeholder/30/30', salary: 70000, about: 'A dedicated developer with a passion for solving complex problems.' },
  { id: 2, name: 'Bob Smith', avatar: '/api/placeholder/30/30', salary: 80000, about: 'An experienced project manager with excellent communication skills.' },
  { id: 3, name: 'Charlie Brown', avatar: '/api/placeholder/30/30', salary: 60000, about: 'A creative designer who loves to bring ideas to life.' },
];

const problems: Problem[] = [
  { id: 1, title: 'Server Maintenance' },
  { id: 2, title: 'Database Optimization' },
  { id: 3, title: 'UI Bug Fix' },
];

export default function WorkerAssignmentTable() {
  const [assignments, setAssignments] = useState<Assignment>({
    1: { workerId: 1, projectTitle: 'Project A' }, // Example assignment
    2: { workerId: 2, projectTitle: null },
    3: { workerId: 3, projectTitle: 'Project B' },
  }); // Example assignments for demonstration
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null); // State for selected worker

  const handleAssign = (problemId: number, workerId: number | null, projectTitle: string | null) => {
    setAssignments(prev => ({ ...prev, [problemId]: { workerId, projectTitle } }));
  };

  const getStatusBadge = (status: 'Assigned' | 'Unassigned') => {
    const colors = { Assigned: 'bg-green-100 text-green-800', Unassigned: 'bg-red-100 text-red-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const handleDetailClick = (workerId: number) => {
    const worker = workers.find(w => w.id === workerId);
    setSelectedWorker(worker || null);
  };

  const closeModal = () => {
    setSelectedWorker(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Worker Assignments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Assigned Project</th>
              <th className="py-2 px-4 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => {
              const assignment = assignments[problem.id];
              const worker = workers.find(w => w.id === assignment.workerId);
              const isAssigned = assignment.workerId !== null;

              return (
                <tr key={problem.id} className="border-b">
                  <td className="py-2 px-4">
                    {isAssigned ? (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={worker?.avatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{worker?.name}</span>
                      </div>
                    ) : (
                      'No Worker Assigned'
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {getStatusBadge(isAssigned ? 'Assigned' : 'Unassigned')}
                  </td>
                  <td className="py-2 px-4">
                    {assignment.projectTitle || 'No Project Assigned'}
                  </td>
                  <td className="py-2 px-4">
                    {/* Show View Details Button regardless of assignment */}
                    <button
                      onClick={() => handleDetailClick(assignment.workerId ?? -1)} // Pass -1 if no worker is assigned
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  
      {/* Modal for Worker Details */}
      {selectedWorker && (
        <WorkerDetailsModal worker={selectedWorker} onClose={closeModal} />
      )}
    </div>
  );
}
