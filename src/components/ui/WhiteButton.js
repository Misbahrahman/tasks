const WhiteButton = ({ onClick, text, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50
        rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
};

export default WhiteButton;
