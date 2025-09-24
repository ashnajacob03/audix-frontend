import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCustomAuth } from './AuthContext';
import listeningTimeTracker from '../services/listeningTimeTracker';
import adScheduler from '../services/adScheduler';
import { type AdConfig } from '../types/adTypes';

interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration?: number;
  previewUrl?: string;
  spotifyId?: string;
  // Optional fields for direct streaming if available
  audioUrl?: string;
  streamUrl?: string;
}

interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isAdPlaying: boolean;
  currentAd: AdConfig | null;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  queueSource: 'liked' | 'playlist' | 'search' | 'recommendations' | 'manual';
  
  // Playback controls
  playSong: (song: Song) => void;
  playQueue: (songs: Song[], startIndex?: number, source?: 'liked' | 'playlist' | 'search' | 'recommendations' | 'manual') => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  
  // Queue management
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shuffle: () => void;
  dismissAd: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useCustomAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestIdRef = useRef<number>(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [currentAd, setCurrentAd] = useState<AdConfig | null>(null);
  const [pendingSongAfterAd, setPendingSongAfterAd] = useState<Song | null>(null);
  const [adAudioDone, setAdAudioDone] = useState(false);
  const [adTimerDone, setAdTimerDone] = useState(false);
  const adTimerRef = useRef<number | null>(null);
  // Refs to avoid stale closures in timers/handlers
  const isAdPlayingRef = useRef<boolean>(false);
  const pendingSongAfterAdRef = useRef<Song | null>(null);
  const adAudioDoneRef = useRef<boolean>(false);
  const adTimerDoneRef = useRef<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queueSource, setQueueSource] = useState<'liked' | 'playlist' | 'search' | 'recommendations' | 'manual'>('manual');

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;

    // Audio event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // If an ad just finished, immediately play the originally selected song
      if (isAdPlayingRef.current) {
        setAdAudioDone(true);
        adAudioDoneRef.current = true;
        if (pendingSongAfterAdRef.current) {
          const songToPlay = pendingSongAfterAdRef.current;
          setIsAdPlaying(false);
          setPendingSongAfterAd(null);
          setAdAudioDone(false);
          setAdTimerDone(false);
          isAdPlayingRef.current = false;
          pendingSongAfterAdRef.current = null;
          adAudioDoneRef.current = false;
          adTimerDoneRef.current = false;
          if (audioRef.current) {
            try { audioRef.current.pause(); } catch {}
          }
          if (adTimerRef.current) {
            clearTimeout(adTimerRef.current);
            adTimerRef.current = null;
          }
          playSongCore(songToPlay).catch(err => {
            console.error('Failed to start song after ad:', err);
            next();
          });
        }
        return;
      }
      // Always attempt to go to the next song; if we're at the end,
      // the next() handler will fetch a recommendation.
      next();
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      const target = e.target as HTMLAudioElement;
      console.error('Audio error details:', {
        error: target.error,
        networkState: target.networkState,
        readyState: target.readyState,
        src: target.src
      });
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentIndex, queue.length]);

  // Keep refs in sync with state
  useEffect(() => { isAdPlayingRef.current = isAdPlaying; }, [isAdPlaying]);
  useEffect(() => { pendingSongAfterAdRef.current = pendingSongAfterAd; }, [pendingSongAfterAd]);
  useEffect(() => { adAudioDoneRef.current = adAudioDone; }, [adAudioDone]);
  useEffect(() => { adTimerDoneRef.current = adTimerDone; }, [adTimerDone]);

  // Initialize ad scheduler
  useEffect(() => {
    // Subscribe to ad scheduler updates
    const unsubscribeAdScheduler = adScheduler.subscribe((ad) => {
      setCurrentAd(ad);
    });

    // Initialize tracking
    listeningTimeTracker.startTracking();

    return () => {
      unsubscribeAdScheduler();
      listeningTimeTracker.stopTracking();
    };
  }, []);

  // Update listening time when playing state changes
  useEffect(() => {
    if (isPlaying) {
      listeningTimeTracker.resumeTracking();
    } else {
      listeningTimeTracker.pauseTracking();
    }
  }, [isPlaying]);

  // Internal helper to attempt to play a list of URLs on the shared audio element
  const attemptPlayUrls = useCallback(async (urls: string[]) => {
    if (!audioRef.current) return;
    const myRequestId = ++playRequestIdRef.current;
    let played = false;
    let lastError: unknown = null;
    for (const url of urls) {
      if (myRequestId !== playRequestIdRef.current) return;
      try {
        const audio = audioRef.current;
        audio.pause();
        audio.src = '';
        audio.load();
        audio.src = url;
        audio.volume = volume;
        audio.currentTime = 0;
        try {
          if (myRequestId !== playRequestIdRef.current) return;
          await audio.play();
        } catch (immediateErr: any) {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              cleanup();
              resolve();
            }, 1200);
            const onCanPlay = () => {
              cleanup();
              resolve();
            };
            const onError = (e: Event) => {
              cleanup();
              reject(e);
            };
            function cleanup() {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
            }
            audio.addEventListener('canplay', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
            audio.load();
          });
          if (myRequestId !== playRequestIdRef.current) return;
          await audio.play();
        }
        played = true;
        break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }
    if (!played) {
      throw lastError || new Error('Failed to play from all candidate URLs');
    }
  }, [volume]);

  // Core song playback without ad logic
  const playSongCore = useCallback(async (song: Song) => {
    if (!audioRef.current) return;
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api';
      const isBlobSource = !!(song.audioUrl && song.audioUrl.startsWith('blob:'));
      const candidateUrls = isBlobSource
        ? [song.audioUrl as string]
        : ([
            `${apiBase}/music/songs/${song._id}/stream`,
            song.audioUrl,
            song.streamUrl,
            song.previewUrl,
          ].filter(Boolean) as string[]);

      if (candidateUrls.length === 0) {
        throw new Error('No available audio source URLs for this song');
      }

      // Optimistically reflect selection in UI
      setCurrentSong(song);
      setIsPlaying(false);
      setCurrentTime(0);

      await attemptPlayUrls(candidateUrls);

      setCurrentSong(song);
      setQueue(prev => {
        const idx = prev.findIndex(s => s._id === song._id);
        if (idx !== -1) {
          setCurrentIndex(idx);
          return prev;
        }
        const nextQueue = [...prev, song];
        setCurrentIndex(nextQueue.length - 1);
        return nextQueue;
      });
      setIsPlaying(true);
    } catch (error: any) {
      if (error && (error.name === 'AbortError')) return;
      console.error('Failed to play song:', error);
      setIsPlaying(false);
    }
  }, [attemptPlayUrls]);

  // Next song function (defined before playSong to avoid circular dependency)
  const next = useCallback(async () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = queue[nextIndex];
      setCurrentIndex(nextIndex);
      try {
        await playSong(nextSong);
        return;
      } catch (e) {
        console.error('Next song failed to play, trying recommendation:', e);
        // fall through to recommendation logic
      }
    }

    // At end of queue: handle based on queue source
    if (queueSource === 'liked' && queue.length > 0) {
      // For liked songs, loop back to the beginning
      try {
        const firstSong = queue[0];
        setCurrentIndex(0);
        await playSong(firstSong);
        return;
      } catch (loopErr) {
        console.error('Liked songs loop failed:', loopErr);
      }
    }

    // For other queue sources, fetch recommendations and continue
    try {
      const existingIds = new Set(queue.map(s => s._id));
      // Only fetch recommendations if user is authenticated
      let recs = [];
      if (isAuthenticated) {
        try {
          recs = await api.getRecommendations(10, { suppressAuthRedirect: true });
        } catch (apiError) {
          console.log('Recommendations API failed, trying popular songs:', (apiError as any)?.message || apiError);
          // Fallback to popular songs if recommendations fail
          try {
            recs = await api.getPopularSongs(10, undefined, { suppressAuthRedirect: true });
          } catch (popularError) {
            console.log('Popular songs API failed, trying random songs:', (popularError as any)?.message || popularError);
            // Final fallback to random songs
            try {
              recs = await api.getSongs({ limit: 10 }, { suppressAuthRedirect: true });
            } catch (songsError) {
              console.log('Random songs API failed:', (songsError as any)?.message || songsError);
              recs = [];
            }
          }
        }
      } else {
        // For unauthenticated users, try to get popular songs
        try {
          recs = await api.getPopularSongs(10, { suppressAuthRedirect: true });
        } catch (popularError) {
          console.log('Popular songs API failed for unauthenticated user, trying random songs:', (popularError as any)?.message || popularError);
          // Fallback to random songs
          try {
            recs = await api.getSongs({ limit: 10 }, { suppressAuthRedirect: true });
          } catch (songsError) {
            console.log('Random songs API failed:', (songsError as any)?.message || songsError);
            recs = [];
          }
        }
      }
      const recommended = Array.isArray(recs)
        ? (() => {
            const candidates = recs.filter((s: any) => s && s._id && !existingIds.has(s._id));
            if (candidates.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * candidates.length);
            return candidates[randomIndex];
          })()
        : null;

      if (recommended) {
        setQueue(prev => [...prev, recommended]);
        setCurrentIndex(prev => prev + 1);
        try {
          await playSong(recommended as any);
          return;
        } catch (err) {
          console.error('Recommended next failed, trying another:', err);
        }
      }

      if (Array.isArray(recs) && recs.length > 0) {
        const randomIndex = Math.floor(Math.random() * recs.length);
        const fallback = recs[randomIndex];
        setQueue(prev => [...prev, fallback]);
        setCurrentIndex(prev => prev + 1);
        try {
          await playSong(fallback as any);
        } catch (err2) {
          console.error('Fallback recommended next failed:', err2);
        }
      }
      // Absolute last resort: loop within current queue
      else if (queue.length > 0) {
        try {
          const nextIndexInLoop = (currentIndex + 1) % queue.length;
          const loopSong = queue[nextIndexInLoop];
          setCurrentIndex(nextIndexInLoop);
          await playSong(loopSong);
        } catch (loopErr) {
          console.error('Loop fallback failed:', loopErr);
        }
      }
    } catch (e) {
      console.error('Failed to fetch recommended next song:', e);
      // If recommendations fail, just stop at the end of the queue
      // Don't throw error to prevent breaking the UI
    }
  }, [currentIndex, queue, queueSource, isAuthenticated]);

  // Play a single song (with time-based ads for free users and unauthenticated users)
  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;
    const isPremium = !!user && (user.accountType === 'premium');
    const isBlobSource = !!(song.audioUrl && song.audioUrl.startsWith('blob:'));
    
    // Check if we should play a time-based ad
    // Show ads for: unauthenticated users, free users, but NOT premium users
    const shouldPlayTimeBasedAd = isBlobSource ? false : !isPremium && adScheduler.shouldPlayAd();

    if (shouldPlayTimeBasedAd) {
      try {
        const ad = await adScheduler.playNextAd();
        if (ad) {
          // Reset ad state and start timer for the overlay
          if (adTimerRef.current) {
            clearTimeout(adTimerRef.current);
            adTimerRef.current = null;
          }
          setAdAudioDone(false);
          setAdTimerDone(false);
          setIsAdPlaying(true);
          setPendingSongAfterAd(song);
          setIsPlaying(false);
          setCurrentTime(0);
          
          // Set timer based on ad duration
          const adDurationMs = ad.duration * 1000;
          adTimerRef.current = window.setTimeout(() => {
            setAdTimerDone(true);
            adTimerDoneRef.current = true;
            // After ad duration, dismiss overlay and play song
            const songToPlayNow = pendingSongAfterAdRef.current || null;
            setIsAdPlaying(false);
            setPendingSongAfterAd(null);
            setAdAudioDone(false);
            setAdTimerDone(false);
            isAdPlayingRef.current = false;
            pendingSongAfterAdRef.current = null;
            adAudioDoneRef.current = false;
            adTimerDoneRef.current = false;
            if (audioRef.current) {
              try { audioRef.current.pause(); } catch {}
            }
            if (adTimerRef.current) {
              clearTimeout(adTimerRef.current);
              adTimerRef.current = null;
            }
            // Mark ad as finished
            adScheduler.finishCurrentAd();
            if (songToPlayNow) {
              playSongCore(songToPlayNow).catch(err => {
                console.error('Failed to start song after ad timer:', err);
                next();
              });
            }
          }, adDurationMs);
          
          // Start playing the ad; when it ends, handleEnded will trigger song playback
          await attemptPlayUrls([ad.audioUrl]);
          return;
        }
      } catch (e) {
        console.warn('Time-based ad failed to play, proceeding to song directly:', e);
        // Mark ad as finished even if it failed
        adScheduler.finishCurrentAd();
        // Keep overlay for the remainder of ad duration even if audio failed
        setAdAudioDone(true);
        adAudioDoneRef.current = true;
        if (!adTimerRef.current) {
          const adDurationMs = 10000; // Default 10 seconds
          adTimerRef.current = window.setTimeout(() => {
            setAdTimerDone(true);
            adTimerDoneRef.current = true;
            if (isAdPlayingRef.current && pendingSongAfterAdRef.current) {
              const songToPlayNow = pendingSongAfterAdRef.current;
              setIsAdPlaying(false);
              setPendingSongAfterAd(null);
              setAdAudioDone(false);
              setAdTimerDone(false);
              isAdPlayingRef.current = false;
              pendingSongAfterAdRef.current = null;
              adAudioDoneRef.current = false;
              adTimerDoneRef.current = false;
              if (adTimerRef.current) {
                clearTimeout(adTimerRef.current);
                adTimerRef.current = null;
              }
              playSongCore(songToPlayNow).catch(err => {
                console.error('Failed to start song after failed ad:', err);
                next();
              });
            }
          }, adDurationMs);
        }
        return;
      }
    }

    await playSongCore(song);
  }, [user, attemptPlayUrls, playSongCore, next]);

  // Play a queue of songs
  const playQueue = useCallback(async (songs: Song[], startIndex = 0, source: 'liked' | 'playlist' | 'search' | 'recommendations' | 'manual' = 'manual') => {
    if (songs.length === 0) return;
    
    setQueue(songs);
    setCurrentIndex(startIndex);
    setQueueSource(source);
    
    const songToPlay = songs[startIndex];
    await playSong(songToPlay);
  }, [playSong]);

  // Pause playback
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Resume playback
  const resume = useCallback(async () => {
    if (audioRef.current && currentSong) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to resume playback:', error);
      }
    }
  }, [currentSong]);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);


  // Previous song (professional behavior: if >3s into track, restart; else go to previous)
  const previous = useCallback(async () => {
    // If we're more than 3 seconds into the current track, just restart it
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
      return;
    }

    // Otherwise, go to the previous track if available
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];
      setCurrentIndex(prevIndex);
      try {
        await playSong(prevSong);
        return;
      } catch (e) {
        console.error('Previous song failed to play:', e);
      }
    } else {
      // At start of queue: just restart current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    }
  }, [currentTime, currentIndex, queue, playSong]);

  // Seek to specific time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Set volume
  const setVolumeHandler = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  // Queue management
  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  const shuffle = useCallback(() => {
    setQueue(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  // Allow UI to immediately stop ad and hide overlay (e.g., Upgrade click)
  const dismissAd = useCallback(() => {
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
      adTimerRef.current = null;
    }
    setIsAdPlaying(false);
    setPendingSongAfterAd(null);
    setAdAudioDone(false);
    setAdTimerDone(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    // Mark ad as finished in scheduler
    adScheduler.finishCurrentAd();
  }, []);

  const value: AudioPlayerContextType = {
    currentSong,
    isPlaying,
    isAdPlaying,
    currentAd,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    queueSource,
    playSong,
    playQueue,
    pause,
    resume,
    stop,
    next,
    previous,
    seek,
    setVolume: setVolumeHandler,
    addToQueue,
    removeFromQueue,
    clearQueue,
    shuffle,
    dismissAd,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}; 