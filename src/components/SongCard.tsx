import { Play, Pause } from "lucide-react";
import { useState } from "react";
import FallbackImage from "./FallbackImage";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

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
        
        {/* Play Button Overlay */}
        <div
          className={`absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-black rounded-full p-3 shadow-lg transition-all duration-300 ${
            isHovered || isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
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
      <div className="space-y-1">
        <h3 className="font-semibold text-white truncate group-hover:text-white">
          {song.title}
        </h3>
        <p className="text-sm text-zinc-400 truncate group-hover:text-zinc-300">
          {song.artist}
        </p>
      </div>
    </div>
  );
};

export default SongCard;