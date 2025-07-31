import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration?: number;
}

interface SongCardProps {
  song: Song;
}

const SongCard = ({ song }: SongCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    // Add your play logic here
  };

  return (
    <div
      className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg p-4 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Song Image */}
      <div className="relative mb-4">
        <img
          src={song.imageUrl}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
        />
        
        {/* Play Button Overlay */}
        <div
          className={`absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-black rounded-full p-3 shadow-lg transition-all duration-300 ${
            isHovered || isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <button onClick={handlePlayClick} className="flex items-center justify-center">
            {isPlaying ? (
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