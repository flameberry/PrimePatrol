// WorkerAssignmentModal.tsx
import Image from "next/image";
import React from "react";

// Define the Worker type
interface Worker {
  id: number;
  name: string;
  avatar: string;
}

// Define props for the modal
interface WorkerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  workers: Worker[];
  onAssignWorker: (workerId: number) => void; // Function to handle worker assignment
}

const WorkerAssignmentModal: React.FC<WorkerAssignmentModalProps> = ({ isOpen, onClose, taskTitle, workers, onAssignWorker }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Assign Workers for {taskTitle}</h2>
        <ul className="space-y-2">
          {workers.map(worker => (
            <li key={worker.id} className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center">
                <Image src={worker.avatar} alt={worker.name} className="w-8 h-8 rounded-full mr-2" />
                <span>{worker.name}</span>
              </div>
              <button
                onClick={() => {
                  onAssignWorker(worker.id);
                  onClose(); // Close modal after assignment
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Assign
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Close
        </button>
      </div>
    </div>
  );
};

export default WorkerAssignmentModal;