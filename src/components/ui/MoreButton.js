// MenuToggleButton.jsx
import React from "react";
import { MoreVertical } from "lucide-react";

const MoreButton = ({ isMenuOpen, setIsMenuOpen }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 
        hover:bg-slate-50 hover:shadow-sm"
    >
      <MoreVertical className="w-5 h-5 text-slate-400" />
    </button>
  );
};

export default MoreButton;
