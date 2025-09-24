import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import FallbackImage from '@/components/FallbackImage';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Check, Play, Shuffle } from 'lucide-react';

const ArtistProfile: React.FC = () => {
  const { name = '' } = useParams();
  const decodedName = useMemo(() => decodeURIComponent(name), [name]);
  const { playQueue } = useAudioPlayer();
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getArtistProfile(decodedName);
      setArtist(data?.artist || null);
      setSongs(data?.songs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [decodedName]);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    playQueue(songs.map((s: any) => ({
      _id: s._id,
      title: s.title,
      artist: s.artist,
      imageUrl: s.imageUrl,
      duration: s.duration,
      previewUrl: s.previewUrl,
      audioUrl: s.audioUrl,
      streamUrl: s.streamUrl,
    })), 0, 'search');
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playQueue(shuffled.map((s: any) => ({
      _id: s._id,
      title: s.title,
      artist: s.artist,
      imageUrl: s.imageUrl,
      duration: s.duration,
      previewUrl: s.previewUrl,
      audioUrl: s.audioUrl,
      streamUrl: s.streamUrl,
    })), 0, 'search');
  };

  const toggleFollow = async () => {
    if (!artist) return;
    if (busy) return;
    setBusy(true);
    try {
      const wasFollowing = !!artist.isFollowing;
      setArtist((a: any) => ({ ...a, isFollowing: !wasFollowing, followerCount: Math.max(0, (a?.followerCount || 0) + (!wasFollowing ? 1 : -1)) }));
      const resp = await api.followArtist(artist.name, { suppressAuthRedirect: true } as any);
      if (resp && typeof resp.isFollowing === 'boolean') {
        setArtist((a: any) => ({ ...a, isFollowing: resp.isFollowing }));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-40 rounded-xl bg-zinc-900/60 mb-6" />
          <div className="h-6 w-60 bg-zinc-900/60 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-40 bg-zinc-900/60 rounded-lg" />
            ))}
          </div>
        </div>
      ) : artist ? (
        <>
          <div className="rounded-xl bg-gradient-to-b from-zinc-900/80 to-black/60 border border-white/5 p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-1 ring-white/10">
                <FallbackImage src={artist.imageUrl || ''} alt={artist.name} className="w-full h-full object-cover" fallbackSeed={artist.name} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold truncate">{artist.name}</h1>
                <div className="text-sm text-zinc-400">{artist.songCount} songs • {artist.followerCount} followers</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={handlePlayAll}><Play className="h-4 w-4 mr-1.5" /> Play</Button>
                  <Button variant="secondary" onClick={handleShuffle}><Shuffle className="h-4 w-4 mr-1.5" /> Shuffle</Button>
                  {artist.isFollowing ? null : (
                    <Button variant="secondary" disabled={busy} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(); }}>Follow</Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {songs.map((s: any, idx: number) => (
              <button key={s._id || idx} onClick={() => playQueue(songs as any, idx, 'search')} className="group text-left rounded-lg p-3 bg-zinc-900/50 border border-white/5 hover:border-white/10 hover:bg-zinc-900 transition-colors">
                <div className="aspect-square rounded-md overflow-hidden mb-2">
                  <FallbackImage src={s.imageUrl || ''} alt={s.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" fallbackSeed={s.title} />
                </div>
                <div className="font-medium truncate" title={s.title}>{s.title}</div>
                <div className="text-sm text-zinc-400 truncate" title={s.artist}>{s.artist}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-zinc-400">Artist not found.</div>
      )}
    </div>
  );
};

export default ArtistProfile;


