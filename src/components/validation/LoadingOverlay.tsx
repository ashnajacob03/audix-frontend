import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Processing...',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
        flex items-center justify-center transition-all duration-300
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      <div className="bg-[#121212] rounded-2xl p-8 shadow-2xl border border-[#282828] max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative">
            <Loader2 className="w-12 h-12 text-[#1db954] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-[#1db954]/20 rounded-full animate-pulse" />
          </div>
          
          {/* Message */}
          <div className="text-center">
            <p id="loading-message" className="text-white font-medium text-lg">
              {message}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Please wait a moment...
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-[#1db954] h-1 rounded-full animate-pulse"
              style={{ 
                width: '60%',
                animation: 'loading-progress 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-progress {
          0%, 100% { width: 30%; }
          50% { width: 80%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;