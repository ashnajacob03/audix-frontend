import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api.js';
import FallbackImage from '@/components/FallbackImage';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Play, Pause, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface SongData {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration?: number;
  previewUrl?: string;
}

const Song = () => {
  const { id } = useParams();
  const [song, setSong] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playSong, currentSong, isPlaying, pause, resume } = useAudioPlayer();
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await api.getSong(id);
        const data = resp?.data || resp; // normalize
        if (!data) throw new Error('Song not found');
        setSong({
          _id: data._id || data.id,
          title: data.title,
          artist: data.artist,
          imageUrl: data.imageUrl,
          duration: data.duration,
          previewUrl: data.previewUrl,
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load song');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  // Attempt autoplay when song loads
  useEffect(() => {
    const attemptAutoplay = async () => {
      if (!song || autoplayAttempted) return;
      setAutoplayAttempted(true);
      try {
        await playSong(song as any);
      } catch (e) {
        // Some browsers block autoplay without user gesture
        toast((t) => (
          <span>
            Autoplay blocked. Click Play to start.
            <button
              onClick={() => { toast.dismiss(t.id); handlePlay(); }}
              className="ml-3 underline text-green-400"
            >
              Play
            </button>
          </span>
        ));
      }
    };
    attemptAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  const handlePlay = () => {
    if (!song) return;
    if (currentSong?._id === song._id) {
      if (isPlaying) pause(); else resume();
      return;
    }
    playSong(song as any);
  };

  if (loading) {
    return (
      <div className="p-6 text-zinc-300">Loading…</div>
    );
  }

  if (error || !song) {
    return (
      <div className="p-6 text-zinc-300">
        <div className="text-red-400 mb-2">{error || 'Song not found'}</div>
        <Link to="/" className="text-green-400 hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-4 h-4" /> Go back home
        </Link>
      </div>
    );
  }

  const isThisPlaying = currentSong?._id === song._id && isPlaying;

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-72 sm:h-72 w-full h-64 relative">
            <FallbackImage src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" fallbackSeed={song._id} />
          </div>
          <div className="flex-1 p-5">
            <h1 className="text-white text-2xl font-semibold mb-1 truncate">{song.title}</h1>
            <div className="text-zinc-400 mb-4">{song.artist}</div>
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full"
            >
              {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />} 
              {isThisPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Song;



