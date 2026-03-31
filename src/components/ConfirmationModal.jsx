import LoadingDots from './LoadingDots';

/**
 * ConfirmationModal — A reusable modal for destructive actions.
 * 
 * Features:
 * - Responsive design: Centered on desktop, full-width bottom sheet style on mobile.
 * - Loading state support.
 */
function ConfirmationModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isLoading,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger" 
}) {
  const confirmButtonClass = variant === "danger" 
    ? "bg-red-600 hover:bg-red-700 text-white" 
    : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm modal-overlay" onClick={onCancel}>
      <div 
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl modal-content p-6 border-t sm:border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 order-2 sm:order-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 order-1 sm:order-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] ${confirmButtonClass} disabled:opacity-50`}
          >
            {isLoading ? <LoadingDots /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
