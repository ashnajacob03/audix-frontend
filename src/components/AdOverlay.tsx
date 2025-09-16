import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface AdOverlayProps {
  seconds?: number;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ seconds = 10 }) => {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState<number>(seconds);
  const { dismissAd } = useAudioPlayer();

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const goPremium = () => {
    // Immediately stop ad and hide overlay, then navigate
    dismissAd();
    navigate('/premium');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90">
      <div className="w-full max-w-xl mx-4 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm uppercase tracking-wider text-zinc-400">Sponsored</div>
          <div className="text-sm text-zinc-300">Ad ends in {remaining}s</div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Enjoy uninterrupted music with Premium</h2>
          <p className="text-zinc-300">Upgrade to remove ads, get unlimited skips, and listen in high quality.</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goPremium}
            className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            Upgrade to Premium
          </button>
          <div className="text-xs text-zinc-400">Your song will start right after this short ad.</div>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${((seconds - remaining) / seconds) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdOverlay;


