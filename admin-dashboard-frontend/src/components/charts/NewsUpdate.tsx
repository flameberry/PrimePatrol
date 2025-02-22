import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const initialUpdates = [
  { id: 1, headline: "Heavy Rains Cause Flooding in Latur", description: "Severe waterlogging disrupts daily life as emergency services are deployed." },
  { id: 2, headline: "Kolhapur Faces Power Outage", description: "Unexpected grid failure leaves several areas without electricity for hours." },
  { id: 3, headline: "Traffic Jam in Chembur", description: "Massive congestion reported due to road repairs and heavy monsoon." },
  { id: 4, headline: "Water Shortage in Thane", description: "Residents struggle as water supply is disrupted due to pipeline damage." },
];

const NewsUpdate = () => {
  const [updates, setUpdates] = useState(initialUpdates);

  // Simulating new updates every 5 seconds (manual for now)
  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdate = {
        id: Date.now(), // Unique ID for animation
        headline: `Breaking News ${updates.length + 1}`,
        description: "Details are being updated as the situation unfolds.",
      };

      setUpdates((prevUpdates) => [newUpdate, ...prevUpdates.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [updates]);

  return (
    <div className="p-2 rounded-2xl shadow-lg w-full max-w-lg mx-auto">
      <div className="overflow-hidden h-96">
        <AnimatePresence>
          {updates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="p-4 mb-2 bg-gray-100 rounded-xl shadow"
            >
              <h4 className="text-lg font-semibold text-gray-900">{update.headline}</h4>
              <p className="text-sm text-gray-700">{update.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewsUpdate;
