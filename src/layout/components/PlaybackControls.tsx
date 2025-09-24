import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import FallbackImage from "@/components/FallbackImage";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  ExternalLink,
  Music,
  Download,
  Volume1,
  VolumeX,
  Heart,
  ThumbsDown,
  ListPlus,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useCustomAuth } from "@/contexts/AuthContext";
import { SkipLimitModal } from "@/components/SkipLimitModal";
import api from "@/services/api";
import { hasOfflineSong, saveOfflineSong } from "@/utils/offline";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Using a custom lightweight modal below instead of dropdown for a more professional UX

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useCustomAuth();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    skipCount,
    showSkipLimitModal,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    closeSkipLimitModal
  } = useAudioPlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [dislikeBusy, setDislikeBusy] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [addBusyId, setAddBusyId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [extractingInBackground, setExtractingInBackground] = useState(false);
  const [showExtractToast, setShowExtractToast] = useState(false);
  const [extractToastText, setExtractToastText] = useState('');
  const [extractProgress, setExtractProgress] = useState(0);

  // Sync liked/disliked state when song changes
  useEffect(() => {
    let cancelled = false;
    const loadInteraction = async () => {
      if (!currentSong) return;
      if (!isAuthenticated) return;
      try {
        const interaction = await api.getSongInteraction(currentSong._id, { suppressAuthRedirect: true } as any);
        if (!cancelled) {
          setIsLiked(interaction.interaction === 'like');
          setIsDisliked(interaction.interaction === 'dislike');
          setLikeCount(interaction.likeCount || 0);
          setDislikeCount(interaction.dislikeCount || 0);
        }
      } catch (e) {
        // ignore
      }
    };
    setIsLiked(false);
    setIsDisliked(false);
    setLikeCount(0);
    setDislikeCount(0);
    loadInteraction();
    return () => {
      cancelled = true;
    };
  }, [currentSong?._id, isAuthenticated]);

  // Check offline saved state when song changes
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!currentSong?._id) {
        setIsSavedOffline(false);
        return;
      }
      try {
        const exists = await hasOfflineSong(currentSong._id);
        if (!cancelled) setIsSavedOffline(!!exists);
      } catch {
        if (!cancelled) setIsSavedOffline(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [currentSong?._id]);

  // Load lyrics when opened or song changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentSong || !showLyrics) return;
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
  }, [currentSong?._id, showLyrics]);

  const handleToggleLike = async () => {
    if (!currentSong || likeBusy) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLikeBusy(true);
    try {
      const resp = await api.likeSong(currentSong._id, { suppressAuthRedirect: true } as any);
      setIsLiked(resp.interaction === 'like');
      setIsDisliked(resp.interaction === 'dislike');
      setLikeCount(resp.likeCount || 0);
      setDislikeCount(resp.dislikeCount || 0);
    } catch (e) {
      // optimistic revert
    } finally {
      setLikeBusy(false);
    }
  };

  const handleToggleDislike = async () => {
    if (!currentSong || dislikeBusy) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setDislikeBusy(true);
    try {
      const resp = await api.dislikeSong(currentSong._id, { suppressAuthRedirect: true } as any);
      setIsLiked(resp.interaction === 'like');
      setIsDisliked(resp.interaction === 'dislike');
      setLikeCount(resp.likeCount || 0);
      setDislikeCount(resp.dislikeCount || 0);
    } catch (e) {
      // optimistic revert
    } finally {
      setDislikeBusy(false);
    }
  };
  const handleDownload = async () => {
    if (!currentSong) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Allow only premium-like accounts
    const isPremium = user && user.accountType && user.accountType !== 'free';
    if (!isPremium) {
      alert('Downloads are available for premium members.');
      return;
    }
      try {
      setDownloading(true);
        setDownloadProgress(0);
      // Try dedicated download endpoint first
      let blob: Blob;
      try {
        blob = await api.requestBlobWithProgress(`/music/songs/${currentSong._id}/download`, { method: 'GET', onProgress: (p: number) => setDownloadProgress(p) });
      } catch (primaryErr: any) {
        // Fallback: capture the streaming source as a blob if direct download unavailable
        try {
          blob = await api.requestBlobWithProgress(`/music/songs/${currentSong._id}/stream`, { method: 'GET', onProgress: (p: number) => setDownloadProgress(p) });
        } catch (streamErr: any) {
          throw primaryErr || streamErr;
        }
      }

      // Derive filename (best-effort without headers)
      const disposition = '';
      let filename = '';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition || '');
      if (match) {
        filename = decodeURIComponent(match[1] || match[2] || '');
      }
      if (!filename) {
        const safeTitle = (currentSong.title || 'track').replace(/[^a-z0-9_\-]+/gi, '_');
        const safeArtist = (currentSong.artist || 'artist').replace(/[^a-z0-9_\-]+/gi, '_');
        filename = `${safeTitle}-${safeArtist}.mp3`;
      }

      // Save offline
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
      // Notify listeners and navigate to Downloads
      try { window.dispatchEvent(new CustomEvent('offline:saved', { detail: { id: currentSong._id } })); } catch {}
      navigate('/downloads');
    } catch (e: any) {
      alert(e?.message || 'Failed to download.');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Background extraction saves the audio offline silently without navigation
  const handleBackgroundExtraction = async () => {
    if (!currentSong) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (extractingInBackground || isSavedOffline) return;
    setExtractingInBackground(true);
    setShowExtractToast(true);
    setExtractToastText('Extracting background…');
    setExtractProgress(0);
    try {
      // Try dedicated download endpoint, fallback to stream
      let blob: Blob;
      try {
        blob = await api.requestBlobWithProgress(`/music/songs/${currentSong._id}/download`, { method: 'GET', onProgress: (p: number) => setExtractProgress(Math.round(p * 100)) });
      } catch (primaryErr: any) {
        try {
          blob = await api.requestBlobWithProgress(`/music/songs/${currentSong._id}/stream`, { method: 'GET', onProgress: (p: number) => setExtractProgress(Math.round(p * 100)) });
        } catch (streamErr: any) {
          throw primaryErr || streamErr;
        }
      }

      // Save offline for availability in app
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

      // Also trigger a browser download for the user
      const safeTitle = (currentSong.title || 'track').replace(/[^a-z0-9_\-]+/gi, '_');
      const safeArtist = (currentSong.artist || 'artist').replace(/[^a-z0-9_\-]+/gi, '_');
      const filename = `${safeTitle}-${safeArtist}.mp3`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);

      setExtractToastText('Extraction completed. Download started.');
      setExtractProgress(100);
      setTimeout(() => setShowExtractToast(false), 2000);
    } catch (e: any) {
      // Silent failure notice for background extraction
      console.warn('Background extraction failed', e);
      setExtractToastText('Extraction failed');
      setTimeout(() => setShowExtractToast(false), 2000);
    } finally {
      setExtractingInBackground(false);
    }
  };

  const ensurePlaylistsLoaded = async () => {
    if (isLoadingPlaylists) return;
    setIsLoadingPlaylists(true);
    try {
      console.log('Loading playlists...');
      const data = await api.getPlaylists({ suppressAuthRedirect: true } as any);
      console.log('Fetched playlists response:', data);
      
      // Check if the response is an error object
      if (data && data.error) {
        console.log('Error loading playlists:', data.error);
        setPlaylists([]);
      } else {
        const playlistsArray = Array.isArray(data) ? data : [];
        console.log('Successfully loaded', playlistsArray.length, 'playlists');
        setPlaylists(playlistsArray);
      }
    } catch (e) {
      console.error('Failed to load playlists:', e);
      setPlaylists([]);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!currentSong) {
      console.log('No current song to add to playlist');
      return;
    }
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      setIsPlaylistModalOpen(false);
      navigate('/login');
      return;
    }
    console.log('Adding song to playlist:', playlistId, currentSong._id);
    console.log('Current song object:', currentSong);
    setAddBusyId(playlistId);
    try {
      const result = await api.addSongToPlaylist(playlistId, currentSong._id, { suppressAuthRedirect: true } as any);
      console.log('Add to playlist result:', result);
      
      // Check if the response is an error object
      if (result && result.error) {
        console.log('Authentication failed, cannot add song to playlist');
        alert('Authentication failed. Please try logging in again.');
        // Don't close the modal, let user try again
      } else if (result && result.message === 'Song already in playlist') {
        console.log('Song already in playlist');
        alert('This song is already in the playlist.');
        setIsPlaylistModalOpen(false);
      } else {
        console.log('Successfully added song to playlist');
        alert('Song added to playlist successfully!');
        setIsPlaylistModalOpen(false);
      }
    } catch (e) {
      console.error('Failed to add song to playlist:', e);
      alert('Failed to add song to playlist. Please try again.');
    } finally {
      setAddBusyId(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    if (!isAuthenticated) {
      setIsPlaylistModalOpen(false);
      navigate('/login');
      return;
    }
    setCreatingPlaylist(true);
    try {
      const payload = { name: newPlaylistName.trim(), title: newPlaylistName.trim() } as any;
      console.log('Creating playlist with payload:', payload);
      const created = await api.createPlaylist(payload, { suppressAuthRedirect: true } as any);
      console.log('Created playlist result:', created);
      
      if (created && created.error) {
        alert('Failed to create playlist. Please try again.');
        return;
      }
      
      await ensurePlaylistsLoaded();
      if (created && created._id && currentSong) {
        console.log('Adding song to newly created playlist:', created._id);
        const addResult = await api.addSongToPlaylist(created._id, currentSong._id, { suppressAuthRedirect: true } as any);
        console.log('Add to new playlist result:', addResult);
        
        if (addResult && addResult.error) {
          alert('Playlist created but failed to add song. Please try adding it manually.');
        } else {
          alert('Playlist created and song added successfully!');
        }
      }
      setIsPlaylistModalOpen(false);
      setNewPlaylistName("");
    } catch (e) {
      console.error('Failed to create playlist:', e);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setCreatingPlaylist(false);
    }
  };

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

  // Don't render if no current song
  if (!currentSong) {
    return null;
  }

  return (
    <div>
      <div className="h-[100px] bg-gradient-to-b from-zinc-900 to-black border-t border-white/5 p-4">
        <div className="flex justify-between items-center h-full max-w-[1800px] mx-auto">
        {/* currently playing song */}
        <div className="hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]">
          {currentSong && (
            <>
              <div className="relative group">
                <FallbackImage
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded-md"
                  fallbackSeed={currentSong._id}
                />
                {/* Link to song details overlay on hover */}
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

              {/* Lyrics button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/song/${currentSong._id}`}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-full transition-colors relative"
                    >
                      <Music className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>View lyrics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Like button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`p-2 rounded-full transition-colors ${isLiked ? 'text-red-500 hover:text-red-400' : 'text-zinc-400 hover:text-white'} hover:bg-zinc-800/30 ${likeBusy ? 'opacity-50' : ''}`}
                      onClick={handleToggleLike}
                      disabled={likeBusy}
                      aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</p>
                    {likeCount > 0 && <p className="text-xs text-zinc-300">{likeCount} likes</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Dislike button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`p-2 rounded-full transition-colors ${isDisliked ? 'text-red-500 hover:text-red-400' : 'text-zinc-400 hover:text-white'} hover:bg-zinc-800/30 ${dislikeBusy ? 'opacity-50' : ''}`}
                      onClick={handleToggleDislike}
                      disabled={dislikeBusy}
                      aria-label={isDisliked ? 'Undislike' : 'Dislike'}
                    >
                      <ThumbsDown className={`h-5 w-5 ${isDisliked ? 'fill-red-500' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isDisliked ? 'Remove dislike' : 'Dislike song'}</p>
                    {dislikeCount > 0 && <p className="text-xs text-zinc-300">{dislikeCount} dislikes</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Download (premium only) */}
              {user?.accountType && user.accountType !== 'free' ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`relative p-2 rounded-full transition-colors ${downloading ? 'opacity-70' : ''} ${isSavedOffline ? 'text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
                        onClick={isSavedOffline ? undefined : handleDownload}
                        aria-label={isSavedOffline ? 'Saved offline' : 'Download'}
                        disabled={downloading || isSavedOffline}
                      >
                        <Download className="h-5 w-5" />
                        {downloading && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400">
                            {Math.round(downloadProgress * 100)}%
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{isSavedOffline ? 'Saved offline' : 'Save for offline'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}

              {/* Add to playlist modal trigger */}
              <button
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-full transition-colors"
                aria-label="Add to playlist"
                onClick={() => {
                  setIsPlaylistModalOpen(true);
                  if (isAuthenticated) {
                    void ensurePlaylistsLoaded();
                  }
                }}
              >
                <ListPlus className="h-5 w-5" />
              </button>

              {/* Three dots menu beside playlist button */}
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-full transition-colors" aria-label="More actions">
                  <MoreVertical className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px]">
                  <DropdownMenuItem disabled={extractingInBackground || isSavedOffline} onClick={handleBackgroundExtraction}>
                    {isSavedOffline ? 'Already saved' : (extractingInBackground ? 'Extracting…' : 'Extract background')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            {/* Mobile lyrics button */}
            {currentSong && (
              <Link
                to={`/song/${currentSong._id}`}
                className="ml-2 text-zinc-400 hover:text-white"
              >
                <Music className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Lyrics toggle for desktop: subtle down arrow, like Spotify */}
            <Button
              size="icon"
              variant="ghost"
              className={`hidden sm:inline-flex text-zinc-400 hover:text-white ${showLyrics ? 'rotate-180 text-white' : ''} transition-transform`}
              onClick={() => setShowLyrics(v => !v)}
              aria-label="Toggle lyrics"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hidden sm:inline-flex hover:text-white text-zinc-400"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

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

            <Button
              size="icon"
              variant="ghost"
              className="hidden sm:inline-flex hover:text-white text-zinc-400"
            >
              <Repeat className="h-4 w-4" />
            </Button>
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
        <div className="hidden sm:flex items-center gap-2 min-w-[180px] w-[30%] justify-end">
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
          <div className={`pointer-events-auto w-[360px] sm:w-[420px] max-w-[92%] rounded-2xl shadow-2xl border border-white/10 bg-amber-800/90 text-black backdrop-blur ${showLyrics ? 'scale-100' : 'scale-95'} transition-transform`}>
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="text-[11px] font-bold tracking-widest text-black/80">LYRICS</div>
              <button className="p-1.5 text-black/70 hover:text-black" onClick={() => setShowLyrics(false)} aria-label="Close lyrics">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-4 h-[220px] sm:h-[260px]">
              <ScrollArea className="h-full pr-2">
                {loadingLyrics ? (
                  <div className="text-sm text-black/80">Loading lyrics…</div>
                ) : lyrics ? (
                  <div className="space-y-3">
                    {lyrics.split(/\n+/).map((line, idx) => (
                      line.trim().length === 0 ? (
                        <div key={`sp-${idx}`} className="h-3" />
                      ) : (
                        <div key={idx} className="text-lg font-semibold leading-7">{line}</div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-black/80">Lyrics not available.</div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      )}

      {/* Small top-right toast for extraction progress */}
      {showExtractToast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900/95 backdrop-blur border border-white/10 rounded-lg shadow-xl px-4 py-3 w-[280px] text-sm text-zinc-200">
          <div className="font-medium mb-1">Extracting background</div>
          <div className="text-xs text-zinc-400 mb-2">{extractToastText}</div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${extractProgress}%` }} />
          </div>
        </div>
      )}

      {/* Skip Limit Modal */}
      <SkipLimitModal
        isOpen={showSkipLimitModal}
        onClose={closeSkipLimitModal}
        skipCount={skipCount}
        skipLimit={5}
      />

      {/* Add to Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsPlaylistModalOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-zinc-900 border border-white/10 rounded-t-xl sm:rounded-xl p-4 sm:p-6 m-0 sm:m-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-base">Add to playlist</h3>
              <button className="text-zinc-400 hover:text-white" onClick={() => setIsPlaylistModalOpen(false)}>✕</button>
            </div>

            {!isAuthenticated ? (
              <div className="text-sm text-zinc-300">
                <p>Please log in to create and manage playlists.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Create new playlist</label>
                    <div className="flex gap-2">
                      <input
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Playlist name"
                        className="flex-1 bg-zinc-800 text-white text-sm rounded-md px-3 py-2 border border-white/10 outline-none focus:border-white/20"
                      />
                      <Button disabled={creatingPlaylist || !newPlaylistName.trim()} onClick={handleCreatePlaylist}>
                        {creatingPlaylist ? 'Creating…' : 'Create'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-zinc-400">Your playlists</label>
                      {isLoadingPlaylists ? <span className="text-xs text-zinc-500">Loading…</span> : null}
                    </div>
                    <div className="max-h-60 overflow-auto rounded-md border border-white/10 divide-y divide-white/5">
                      {(!isLoadingPlaylists && playlists.length === 0) && (
                        <div className="px-3 py-3 text-sm text-zinc-400">No playlists found</div>
                      )}
                      {playlists.map((pl: any) => (
                        <button
                          key={pl._id}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800/60 text-zinc-200 flex items-center justify-between"
                          onClick={() => handleAddToPlaylist(pl._id)}
                          disabled={addBusyId === pl._id}
                        >
                          <span className="truncate">{pl.name}</span>
                          {addBusyId === pl._id ? <span className="text-xs text-zinc-400">Adding…</span> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};