import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Play, MoreHorizontal, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import FallbackImage from '@/components/FallbackImage';

type LikedSong = {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  duration?: number; // seconds
};

const formatDuration = (seconds?: number) => {
  if (!seconds && seconds !== 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getLikedSongs();
        if (!isMounted) return;
        const songs: LikedSong[] = Array.isArray(data) ? data : (data?.songs || []);
        setLikedSongs(songs);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load liked songs');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
                <p className="text-zinc-400">{likedSongs.length} songs</p>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading liked songs...</div>
            )}
            {error && (
              <div className="text-sm text-red-400">{error}</div>
            )}
          </div>

          {/* Songs List */}
          <div className="bg-zinc-800/40 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-zinc-700/50">
              <div className="grid grid-cols-12 gap-4 text-sm text-zinc-400 font-medium">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-3">Album</div>
                <div className="col-span-2">Duration</div>
              </div>
            </div>

            <div className="divide-y divide-zinc-700/30">
              {likedSongs.map((song, index) => (
                <div key={song._id} className="p-4 hover:bg-zinc-700/30 transition-colors group">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <div className="flex items-center justify-center w-6 h-6">
                        <span className="text-zinc-400 group-hover:hidden">{index + 1}</span>
                        <Play className="w-4 h-4 text-white hidden group-hover:block" />
                      </div>
                    </div>

                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-700/50 flex items-center justify-center">
                        {song.imageUrl ? (
                          <FallbackImage src={song.imageUrl} alt={song.title} className="w-12 h-12 object-cover" fallbackSeed={song._id} />
                        ) : (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{song.title}</p>
                        <p className="text-zinc-400 text-sm">{song.artist}</p>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <p className="text-zinc-400 text-sm">{song.album || '-'}</p>
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">{formatDuration(song.duration)}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-zinc-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoading && likedSongs.length === 0 && !error && (
                <div className="p-6 text-sm text-zinc-400">You haven\'t liked any songs yet.</div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default LikedSongs;