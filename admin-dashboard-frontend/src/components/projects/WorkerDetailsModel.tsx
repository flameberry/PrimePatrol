// WorkerDetailsModal.tsx
import React from 'react';

type WorkerDetailsModalProps = {
  worker: {
    id: number;
    name: string;
    avatar: string;
    salary: number;
    about: string;
  } | null;
  onClose: () => void;
};

const WorkerDetailsModal: React.FC<WorkerDetailsModalProps> = ({ worker, onClose }) => {
  if (!worker) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{worker.name}</h2>
        <img src={worker.avatar} alt={`${worker.name}'s Avatar`} className="w-16 h-16 rounded-full mb-4" />
        <p><strong>Salary:</strong> ${worker.salary.toLocaleString()}</p>
        <p className="mt-2"><strong>About:</strong> {worker.about}</p>
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