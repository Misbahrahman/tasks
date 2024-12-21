// CancelButton.jsx
import React from "react";

const WhiteButton = ({ onClick, text }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
    >
      {text}
    </button>
  );
};

export default WhiteButton;
