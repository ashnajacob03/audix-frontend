import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AdOverlayProps {
  seconds?: number;
  videoSrc?: string; // optional custom video
}

const AdOverlay: React.FC<AdOverlayProps> = ({ seconds = 10, videoSrc }) => {
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState<number>(seconds);
  const { dismissAd } = useAudioPlayer();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Basic, safe external fallback video if none provided (royalty-free promo vibe)
  const fallbackVideo = 'https://cdn.coverr.co/videos/coverr-young-woman-listening-to-music-while-walking-6078/1080p.mp4';
  const resolvedVideo = videoSrc ?? fallbackVideo;

  const carouselImages = [
    '/audix.png'
  ];

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // Keep video muted and try autoplay
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Autoplay might be blocked; we do not expose controls
        });
      }
    }
  }, []);

  const goPremium = () => {
    dismissAd();
    navigate('/premium');
  };

  const progress = ((seconds - remaining) / seconds) * 100;
  const show = remaining > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90"
        >
          {/* Ambient backdrop accents */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              aria-hidden
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.06, opacity: 0.22 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <motion.div
              aria-hidden
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.06, opacity: 0.18 }}
              transition={{ duration: 0.8, delay: 0.05, ease: 'easeOut' }}
              className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
            />
          </div>

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.7 }}
            className="w-full max-w-4xl mx-4 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-0 text-white shadow-2xl relative overflow-hidden"
          >
            {/* Soft glow ring */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="pointer-events-none absolute -inset-px rounded-[14px]"
              style={{
                background:
                  'radial-gradient(1200px 1200px at 0% 0%, rgba(16,185,129,0.06), transparent 60%), radial-gradient(1000px 800px at 100% 100%, rgba(79,70,229,0.06), transparent 60%)'
              }}
            />

            {/* Media + Content layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative z-10">
              {/* Media area */}
              <div className="relative md:h-80 h-56 overflow-hidden">
                {/* Video layer */}
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <video
                    ref={videoRef}
                    src={resolvedVideo}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  {/* Gradient overlays for readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                </motion.div>

                {/* Image carousel overlay */}
                <div className="absolute inset-0">
                  {carouselImages.map((src, idx) => (
                    <motion.img
                      key={src}
                      src={src}
                      alt="Audix"
                      className="absolute inset-0 h-full w-full object-contain p-8"
                      initial={false}
                      animate={{
                        opacity: activeSlide === idx ? 0.9 : 0,
                        scale: activeSlide === idx ? 1.02 : 1.0
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sponsored
                  </div>
                  <div className="text-sm text-zinc-300">Ad ends in {remaining}s</div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                    Enjoy uninterrupted music with Premium
                  </h2>
                  <p className="text-zinc-300">
                    Upgrade to remove ads, get unlimited skips, and listen in high quality.
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                    onClick={goPremium}
                    className="px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Upgrade to Premium
                  </motion.button>
                  <div className="text-xs text-zinc-400">
                    Your song will start right after this short ad.
                  </div>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }}
                  />
                </div>
              </div>
            </div>

            {/* Light sweep */}
            <motion.div
              aria-hidden
              initial={{ x: '-30%' }}
              animate={{ x: '130%' }}
              transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
              className="pointer-events-none absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdOverlay;


