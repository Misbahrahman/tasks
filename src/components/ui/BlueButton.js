import { Plus } from "lucide-react";

const BlueButton = ({ text, isPlus = false, type = "submit", disabled = false, onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center px-4 py-2 text-sm font-medium text-white
        bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-md
        transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPlus && <Plus className="w-4 h-4 mr-2" />}
      {text}
    </button>
  );
};

export default BlueButton;
