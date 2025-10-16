import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import FallbackImage from "@/components/FallbackImage";
import { Pause, Play, SkipBack, SkipForward, Volume2, Volume1, VolumeX, ExternalLink, Shuffle, Heart, Download, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/services/api";
import { hasOfflineSong, saveOfflineSong } from "@/utils/offline";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffled,
    shuffle,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume
  } = useAudioPlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  


  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleNext = () => {
    next();
  };

  const handlePrevious = () => {
    previous();
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    seek(newTime);
  };

  // Handle volume changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };

  const handleToggleLike = async () => {
    if (!currentSong || likeBusy) return;
    setLikeBusy(true);
    try {
      const resp = await api.likeSong(currentSong._id, { suppressAuthRedirect: true } as any);
      setIsLiked(resp?.interaction === 'like');
    } catch {}
    finally {
      setLikeBusy(false);
    }
  };

  const handleOfflineDownload = async () => {
    if (!currentSong || downloading || isSavedOffline) return;
    setDownloading(true);
    setDownloadProgress(0);
    try {
      // Use stream endpoint directly for faster download
      const blob = await api.requestBlobWithProgress(`/music/songs/${currentSong._id}/stream`, {
        method: 'GET',
        onProgress: (p: number) => setDownloadProgress(Math.round(p * 100)),
      });
      await saveOfflineSong({
        id: currentSong._id,
        title: currentSong.title,
        artist: currentSong.artist,
        coverUrl: currentSong.imageUrl,
        durationMs: (duration || 0) * 1000,
        mimeType: blob.type || 'audio/mpeg',
        downloadedAt: Date.now(),
        blob,
      });
      setIsSavedOffline(true);
      try { window.dispatchEvent(new CustomEvent('offline:saved', { detail: { id: currentSong._id } })); } catch {}
    } catch (e: any) {
      alert(e?.message || 'Failed to save offline');
    } finally {
      setDownloading(false);
    }
  };

  // Sync states when song changes
  useEffect(() => {
    setShowLyrics(false);
    setLyrics(null);
    setIsLiked(false);
    setIsSavedOffline(false);
    const run = async () => {
      try {
        if (currentSong?._id) {
          const exists = await hasOfflineSong(currentSong._id);
          setIsSavedOffline(!!exists);
        }
      } catch {}
      try {
        if (currentSong?._id) {
          const interaction = await api.getSongInteraction(currentSong._id, { suppressAuthRedirect: true } as any);
          setIsLiked(interaction?.interaction === 'like');
        }
      } catch {}
    };
    run();
  }, [currentSong?._id]);

  // Load lyrics when toggled
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!showLyrics || !currentSong?._id) return;
      setLoadingLyrics(true);
      try {
        const resp = await api.getSongLyrics(currentSong._id, { suppressAuthRedirect: true } as any);
        const data = (resp && (resp.data || resp)) || {};
        if (!cancelled) {
          const text = typeof data === 'string' ? data : (data.lyrics || data.text || null);
          setLyrics(text);
        }
      } catch {
        if (!cancelled) setLyrics(null);
      } finally {
        if (!cancelled) setLoadingLyrics(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [showLyrics, currentSong?._id]);

  // Don't render if no current song
  if (!currentSong) {
    return null;
  }

  return (
    <div>
      <div className="h-[100px] bg-gradient-to-b from-zinc-900 to-black border-t border-white/5 p-4">
        <div className="flex justify-between items-center h-full max-w-[1800px] mx-auto">
        {/* currently playing song */}
        <div className="hidden sm:flex items-center gap-4 min-w-[220px] w-[30%]">
          {currentSong && (
            <>
              <div className="relative group">
                <FallbackImage
                  src={currentSong.imageUrl || ''}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded-md"
                  fallbackSeed={currentSong._id}
                />
                <Link
                  to={`/song/${currentSong._id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                >
                  <ExternalLink className="h-6 w-6 text-white" />
                </Link>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/song/${currentSong._id}`}
                  className="font-medium truncate hover:underline cursor-pointer"
                >
                  {currentSong.title}
                </Link>
                <div className="text-sm text-zinc-400 truncate">
                  {currentSong.artist}
                </div>
              </div>

            </>
          )}
        </div>

        {/* player controls - Modified for better mobile display */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 max-w-full sm:max-w-[45%]">
          {/* Timer for mobile - visible only on small screens */}
          <div className="flex items-center gap-2 sm:hidden text-xs text-zinc-400 w-full justify-center mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center w-full px-2">
            {/* Left cluster: Lyrics + Like */}
            <div className="flex items-center justify-start w-1/3 gap-2">
              <Button
                size="icon"
                variant="ghost"
                className={`hidden sm:inline-flex hover:text-white ${showLyrics ? 'text-white' : 'text-zinc-400'}`}
                onClick={() => setShowLyrics(v => !v)}
                aria-label="Lyrics"
              >
                <Music className="h-4 w-4" />
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`hidden sm:inline-flex p-2 rounded-full transition-colors ${isLiked ? 'text-red-500 hover:text-red-400' : 'text-zinc-400 hover:text-white'} hover:bg-zinc-800/30 ${likeBusy ? 'opacity-50' : ''}`}
                      onClick={handleToggleLike}
                      disabled={likeBusy}
                      aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Center cluster: Prev / Play-Pause / Next */}
            <div className="flex items-center justify-center flex-1 gap-4 sm:gap-6">
            <Button
              size="icon"
              variant="ghost"
              className="hover:text-white text-zinc-400"
              onClick={handlePrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              className="bg-white hover:bg-white/80 text-black rounded-full h-8 w-8"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="hover:text-white text-zinc-400"
              onClick={handleNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            </div>

            {/* Right cluster: Shuffle + Download */}
            <div className="flex items-center justify-end w-1/3 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`hidden sm:inline-flex hover:text-white transition-colors ${
                        isShuffled 
                          ? 'text-white bg-white/10 hover:bg-white/20' 
                          : 'text-zinc-400 hover:bg-zinc-800/30'
                      }`}
                      onClick={shuffle}
                      aria-label="Shuffle"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isShuffled ? 'Turn off shuffle' : 'Turn on shuffle'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`hidden sm:inline-flex relative p-2 rounded-full transition-colors ${downloading ? 'opacity-70' : ''} ${isSavedOffline ? 'text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
                      onClick={handleOfflineDownload}
                      aria-label={isSavedOffline ? 'Saved offline' : 'Save offline'}
                      disabled={downloading || isSavedOffline}
                    >
                      <Download className="h-5 w-5" />
                      {downloading && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400">{downloadProgress}%</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isSavedOffline ? 'Saved offline' : 'Save for offline'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Progress bar and timer */}
          <div className="w-full flex items-center gap-2 px-2">
            {/* Timer hidden on mobile, visible on larger screens */}
            <span className="hidden sm:inline text-xs text-zinc-400 min-w-[40px]">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="w-full cursor-pointer"
              onValueChange={handleSeek}
            />

            {/* Timer hidden on mobile, visible on larger screens */}
            <span className="hidden sm:inline text-xs text-zinc-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* volume control */}
        <div className="hidden sm:flex items-center gap-2 min-w-[220px] w-[30%] justify-end">
          <div className="flex items-center gap-2">
            {volume === 0 ? (
              <VolumeX className="h-5 w-5 text-zinc-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-5 w-5 text-zinc-400" />
            ) : (
              <Volume2 className="h-5 w-5 text-zinc-400" />
            )}
            <Slider
              className="w-[120px] cursor-pointer"
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
      </div>
      {/* Compact Lyrics Card under playback controls */}
      {currentSong && (
        <div className={`fixed inset-x-0 z-40 flex justify-center pointer-events-none ${showLyrics ? 'bottom-[120px]' : 'bottom-[80px] opacity-0'} transition-all duration-300`}>
          <div className={`pointer-events-auto w-[360px] sm:w-[420px] max-w-[92%] rounded-2xl shadow-2xl border border-white/10 bg-zinc-900/95 text-zinc-100 backdrop-blur ${showLyrics ? 'scale-100' : 'scale-95'} transition-transform`}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="text-[11px] tracking-widest text-zinc-400">LYRICS</div>
              <button className="p-1.5 text-zinc-400 hover:text-white" onClick={() => setShowLyrics(false)} aria-label="Close lyrics">
                <Music className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-4 h-[220px] sm:h-[260px]">
              <ScrollArea className="h-full pr-2">
                {loadingLyrics ? (
                  <div className="text-sm text-zinc-300">Loading lyrics…</div>
                ) : lyrics ? (
                  <div className="space-y-3">
                    {lyrics.split(/\n+/).map((line, idx) => (
                      line.trim().length === 0 ? (
                        <div key={`sp-${idx}`} className="h-3" />
                      ) : (
                        <div key={idx} className="text-base leading-6">{line}</div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">Lyrics not available.</div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};