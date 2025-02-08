import React, { useState, useEffect } from "react";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

type Props = {
  name: string;
  amount: number;
  bgColor: string; // Allows different background colors
  icon: string; // Allows different icons
};

const DataCard = (props: Props) => {
  const { name, amount, bgColor, icon } = props;
  const [currentAmount, setCurrentAmount] = useState(0);

  // Animate the number from 0 to the desired amount
  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds animation
    const increment = Math.ceil(amount / (duration / 100));

    const counter = setInterval(() => {
      start += increment;
      if (start >= amount) {
        setCurrentAmount(amount);
        clearInterval(counter);
      } else {
        setCurrentAmount(start);
      }
    }, 100);

    return () => clearInterval(counter); // Cleanup interval on unmount
  }, [amount]);

  // Select icon based on the passed prop
  const iconComponent = (iconName: string) => {
    switch (iconName) {
      case "chart-bar":
        return <AnalyticsIcon className="h-8 w-8 text-red-500" />;
      case "clipboard-list":
        return <ContentPasteIcon className="h-8 w-8 text-orange-500" />;
      case "check-circle":
        return <CheckCircleOutlineIcon className="h-8 w-8 text-green-500" />;
      case "users":
        return <GroupAddIcon className="h-8 w-8 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${bgColor}`}>
      <div className="flex items-center space-x-4">
        {/* Dynamic Icon */}
        {iconComponent(icon)}

        <div>
          {/* Animated number display */}
          <p className="text-xl font-bold text-gray-800">
            {currentAmount}
          </p>
          <p className="text-gray-500">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
