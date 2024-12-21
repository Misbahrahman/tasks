import { AlertCircle, CheckCircle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, type }) => {
    if (!isOpen) return null;
  
    const modalContent = {
      delete: {
        title: "Delete Project",
        message: "Are you sure you want to delete this project? This action cannot be undone.",
        confirmText: "Delete Project",
        icon: <AlertCircle className="w-6 h-6 text-red-500 mb-2" />,
        confirmButtonClass: "bg-red-500 hover:bg-red-600",
      },
      close: {
        title: "Close Project",
        message: "Are you sure you want to mark this project as closed?",
        confirmText: "Close Project",
        icon: <CheckCircle className="w-6 h-6 text-green-500 mb-2" />,
        confirmButtonClass: "bg-green-500 hover:bg-green-600",
      }
    };
  
    const content = modalContent[type];
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full m-3">
          <div className="text-center">
            {content.icon}
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {content.title}
            </h3>
            <p className="text-slate-600 mb-6">
              {content.message}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${content.confirmButtonClass}`}
            >
              {content.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  
  export default ConfirmationModal;