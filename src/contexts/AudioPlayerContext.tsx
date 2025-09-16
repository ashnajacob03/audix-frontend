import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCustomAuth } from './AuthContext';

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
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  
  // Playback controls
  playSong: (song: Song) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
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
      const candidateUrls = [
        `${apiBase}/music/songs/${song._id}/stream`,
        song.audioUrl,
        song.streamUrl,
        song.previewUrl,
      ].filter(Boolean) as string[];

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

  // Play a single song (with pre-roll ad for free users)
  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;
    const isPremium = !!user && (user.accountType === 'premium');
    const shouldPlayAd = !isPremium; // treat unauthenticated or non-premium as ad-supported

    if (shouldPlayAd) {
      try {
        const adUrlEnv = (import.meta as any).env?.VITE_AD_AUDIO_URL as string | undefined;
        const adUrlFallback = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        const adUrl = adUrlEnv || adUrlFallback;

        // Reset ad state and start 10s timer for the overlay
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
        adTimerRef.current = window.setTimeout(() => {
          setAdTimerDone(true);
          adTimerDoneRef.current = true;
          // After 10s, ALWAYS dismiss overlay. If a song is pending, start it.
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
          if (songToPlayNow) {
            playSongCore(songToPlayNow).catch(err => {
              console.error('Failed to start song after ad timer:', err);
              next();
            });
          }
        }, 10000);
        // Start playing the ad; when it ends, handleEnded will trigger song playback
        await attemptPlayUrls([adUrl]);
        return;
      } catch (e) {
        console.warn('Ad failed to play, proceeding to song directly:', e);
        // Keep overlay for the remainder of 10s even if audio failed
        setAdAudioDone(true);
        adAudioDoneRef.current = true;
        if (!adTimerRef.current) {
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
          }, 10000);
        }
        return;
      }
    }

    await playSongCore(song);
  }, [user, attemptPlayUrls, playSongCore]);

  // Play a queue of songs
  const playQueue = useCallback(async (songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;
    
    setQueue(songs);
    setCurrentIndex(startIndex);
    
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

  // Next song
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

    // At end of queue: fetch a recommendation and continue
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
        ? recs.find((s: any) => s && s._id && !existingIds.has(s._id))
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
        const fallback = recs[0];
        setQueue(prev => [...prev, fallback]);
        setCurrentIndex(prev => prev + 1);
        try {
          await playSong(fallback as any);
        } catch (err2) {
          console.error('Fallback recommended next failed:', err2);
        }
      }
    } catch (e) {
      console.error('Failed to fetch recommended next song:', e);
      // If recommendations fail, just stop at the end of the queue
      // Don't throw error to prevent breaking the UI
    }
  }, [currentIndex, queue, playSong, isAuthenticated]);

  // Previous song
  const previous = useCallback(async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];
      setCurrentIndex(prevIndex);
      try {
        await playSong(prevSong);
        return;
      } catch (e) {
        console.error('Previous song failed to play, trying recommendation:', e);
      }
    }

    // At start of queue: fetch a recommendation and play it as previous
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
        ? recs.find((s: any) => s && s._id && !existingIds.has(s._id))
        : null;

      if (recommended) {
        setQueue(prev => [recommended, ...prev]);
        setCurrentIndex(0);
        try {
          await playSong(recommended as any);
          return;
        } catch (err) {
          console.error('Recommended previous failed, trying another:', err);
        }
      }

      if (Array.isArray(recs) && recs.length > 0) {
        const fallback = recs[0];
        setQueue(prev => [fallback, ...prev]);
        setCurrentIndex(0);
        try {
          await playSong(fallback as any);
        } catch (err2) {
          console.error('Fallback recommended previous failed:', err2);
        }
      }
    } catch (e) {
      console.error('Failed to fetch recommended previous song:', e);
      // If recommendations fail, just stay at the current song
      // Don't throw error to prevent breaking the UI
    }
  }, [currentIndex, queue, playSong, isAuthenticated]);

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
  }, []);

  const value: AudioPlayerContextType = {
    currentSong,
    isPlaying,
    isAdPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
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