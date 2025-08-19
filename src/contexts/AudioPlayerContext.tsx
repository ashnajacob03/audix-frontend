import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
      // Auto-play next song if available
      if (currentIndex < queue.length - 1) {
        next();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
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

  // Play a single song
  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;

    try {
      // Prefer a direct audio URL if provided by the API
      // Then try a provided streamUrl, then our backend stream endpoint, then previewUrl
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api';
      const candidateUrls = [
        song.audioUrl,
        song.streamUrl,
        `${apiBase}/music/songs/${song._id}/stream`,
        song.previewUrl,
      ].filter(Boolean) as string[];

      if (candidateUrls.length === 0) {
        throw new Error('No available audio source URLs for this song');
      }

      let played = false;
      let lastError: unknown = null;
      for (const url of candidateUrls) {
        try {
          audioRef.current.src = url;
          audioRef.current.volume = volume;
          audioRef.current.currentTime = 0;
          // Force the browser to load metadata before play attempt
          await audioRef.current.load?.();
          await audioRef.current.play();
          played = true;
          break;
        } catch (err) {
          lastError = err;
          // Try next candidate
          continue;
        }
      }

      if (!played) {
        throw lastError || new Error('Failed to play from all candidate URLs');
      }

      setCurrentSong(song);
      setQueue([song]);
      setCurrentIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play song:', error);
      // Fallback: try to play with a different approach or show error
    }
  }, [volume]);

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
      await playSong(nextSong);
    }
  }, [currentIndex, queue, playSong]);

  // Previous song
  const previous = useCallback(async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];
      setCurrentIndex(prevIndex);
      await playSong(prevSong);
    }
  }, [currentIndex, queue, playSong]);

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

  const value: AudioPlayerContextType = {
    currentSong,
    isPlaying,
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
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}; 