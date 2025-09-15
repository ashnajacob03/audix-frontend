import React from 'react';
import { Link } from 'react-router-dom';
import { X, Crown, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkipLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  skipCount: number;
  skipLimit: number;
}

export const SkipLimitModal: React.FC<SkipLimitModalProps> = ({
  isOpen,
  onClose,
  skipCount,
  skipLimit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-full">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Wait, bro! Keep it slow like that! 🎵
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-center mb-6">
          You've used all {skipLimit} of your daily skips. Free users get {skipLimit} skips per day, 
          but Premium users get unlimited skips!
        </p>

        {/* Skip count display */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Daily Skips Used</span>
            <span className="text-sm font-medium text-white">{skipCount}/{skipLimit}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(skipCount / skipLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-white mb-2">Upgrade to Premium for:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Music className="h-4 w-4 text-green-500" />
              <span>Unlimited skips</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Ad-free listening</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Music className="h-4 w-4 text-green-500" />
              <span>High-quality audio</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          >
            Maybe Later
          </Button>
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <Link to="/premium">
              <Crown className="h-4 w-4 mr-2" />
              Go Premium
            </Link>
          </Button>
        </div>

        {/* Reset info */}
        <p className="text-xs text-zinc-500 text-center mt-4">
          Your skips will reset tomorrow at midnight
        </p>
      </div>
    </div>
  );
};


