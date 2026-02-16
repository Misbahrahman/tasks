import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const config = {
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    headerBg: 'bg-red-50 border-red-100',
    btnClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    headerBg: 'bg-emerald-50 border-emerald-100',
    btnClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    headerBg: 'bg-blue-50 border-blue-100',
    btnClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    headerBg: 'bg-amber-50 border-amber-100',
    btnClass: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
  },
};

const AppModal = ({ isOpen, onClose, type = 'info', title, message }) => {
  if (!isOpen) return null;

  const { icon: Icon, iconColor, headerBg, btnClass } = config[type] || config.info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-white/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${btnClass}`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppModal;
