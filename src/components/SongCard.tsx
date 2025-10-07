import { Play, Pause, MoreVertical, Share2, Music } from "lucide-react";
import { useState } from "react";
import FallbackImage from "./FallbackImage";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useCustomAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ShareSongModal from "@/components/ShareSongModal";
import BackgroundExtractionModal from "@/components/BackgroundExtractionModal";

interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration?: number;
  previewUrl?: string;
  spotifyId?: string;
}

interface SongCardProps {
  song: Song;
}

const SongCard = ({ song }: SongCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playSong, currentSong, isPlaying, pause, resume } = useAudioPlayer();
  const { isAuthenticated } = useCustomAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  
  // Check if this song is currently playing
  const isThisSongPlaying = currentSong?._id === song._id && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentSong?._id === song._id) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
      return;
    }

    // If another song is playing, play this one
    playSong(song);
  };

  return (
    <div
      className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg p-4 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Song Image */}
      <div className="relative mb-4">
        <FallbackImage
          src={song.imageUrl}
          alt={song.title}
          className="w-full aspect-square rounded-md shadow-lg"
          fallbackSeed={song._id}
        />
        
        {/* Play Button Overlay - Always visible on mobile, visible on hover for desktop */}
        <div
          className={`absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-black rounded-full p-3 shadow-lg transition-all duration-300 
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0
            ${isThisSongPlaying ? 'opacity-100 translate-y-0' : ''}`}
        >
          <button onClick={handlePlayClick} className="flex items-center justify-center">
            {isThisSongPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div className="space-y-1 pr-8">
        <h3 className="font-semibold text-white truncate group-hover:text-white">
          {song.title}
        </h3>
        <p className="text-sm text-zinc-400 truncate group-hover:text-zinc-300">
          {song.artist || 'Unknown Artist'}
        </p>
      </div>
      {/* Three-dot menu - Always visible on mobile, visible on hover for desktop */}
      <div className="absolute bottom-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-zinc-300 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </DropdownMenuItem>
            {isAuthenticated && (
              <DropdownMenuItem onClick={() => setIsBackgroundModalOpen(true)}>
                <Music className="w-4 h-4 mr-2" /> Extract Background
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ShareSongModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        song={{ _id: song._id, title: song.title, artist: song.artist }}
      />

      <BackgroundExtractionModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        song={song}
      />
    </div>
  );
};

export default SongCard;