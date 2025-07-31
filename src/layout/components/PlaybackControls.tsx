import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  Volume1,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Mock current song data - replace with your actual state management
const mockCurrentSong = {
  _id: "1",
  title: "Blinding Lights",
  artist: "The Weeknd",
  imageUrl: "https://via.placeholder.com/56x56/1db954/ffffff?text=BL"
};

export const PlaybackControls = () => {
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes mock duration
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong] = useState(mockCurrentSong); // Mock current song

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    // Mock next functionality
    console.log("Next song");
  };

  const handlePrevious = () => {
    // Mock previous functionality
    console.log("Previous song");
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
  };

  // Handle volume changes
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };

  // Mock time update
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  return (
    <div className="h-[100px] bg-gradient-to-b from-zinc-900 to-black border-t border-white/5 p-4">
      <div className="flex justify-between items-center h-full max-w-[1800px] mx-auto">
        {/* currently playing song */}
        <div className="hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]">
          {currentSong && (
            <>
              <div className="relative group">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 object-cover rounded-md"
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
  );
};