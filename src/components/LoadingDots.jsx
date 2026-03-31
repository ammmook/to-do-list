/**
 * LoadingDots — A simple animated loading indicator.
 * Displays three dots that fade in and out sequentially.
 */
function LoadingDots({ className = "" }) {
  return (
    <div className={`flex items-center gap-1 inline-flex ${className}`}>
      <span className="w-1 h-1 bg-current rounded-full animate-loading-dot-1" />
      <span className="w-1 h-1 bg-current rounded-full animate-loading-dot-2" />
      <span className="w-1 h-1 bg-current rounded-full animate-loading-dot-3" />
    </div>
  );
}

export default LoadingDots;
