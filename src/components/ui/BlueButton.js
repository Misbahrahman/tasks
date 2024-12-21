
import { Plus } from "lucide-react";
import React from "react";

const BlueButton = ({ text , isPlus = false}) => {
  return (
    <button
      type="submit"
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-md transition-all"
    >
      {isPlus ?? <Plus className="w-4 h-4 mr-2" /> }
      {text}
    </button>
  );
};

export default BlueButton;
