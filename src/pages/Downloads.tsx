import { useEffect, useMemo, useState } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { listOfflineSongs, getOfflineSong, deleteOfflineSong } from '@/utils/offline';
import type { OfflineSongMeta } from '@/utils/offline';
import { Button } from '@/components/ui/button';
import FallbackImage from '@/components/FallbackImage';
import { Download, Trash2, Play, Pause } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export default function Downloads() {
  const { isAuthenticated, user } = useCustomAuth();
  const isPremium = !!(user?.accountType && user.accountType !== 'free');
  const [items, setItems] = useState<OfflineSongMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { playSong } = useAudioPlayer();

  const canAccess = isAuthenticated && isPremium;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await listOfflineSongs();
        if (mounted) setItems(list);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load downloads');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const onSaved = () => { if (canAccess) load(); };
    const onFocus = () => { if (canAccess) load(); };

    if (canAccess) load();
    window.addEventListener('offline:saved', onSaved as EventListener);
    window.addEventListener('focus', onFocus);
    return () => {
      mounted = false;
      window.removeEventListener('offline:saved', onSaved as EventListener);
      window.removeEventListener('focus', onFocus);
    };
  }, [canAccess]);

  const handlePlay = async (id: string) => {
    const rec = await getOfflineSong(id);
    if (!rec) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(rec.blob);
    setAudioUrl(url);
    setCurrentId(id);
    // Use global player with blob URL so the bottom player handles playback
    await playSong({
      _id: rec.id,
      title: rec.title,
      artist: rec.artist || 'Unknown',
      imageUrl: rec.coverUrl || '',
      audioUrl: url,
    } as any);
  };

  const handleDelete = async (id: string) => {
    await deleteOfflineSong(id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (currentId === id) {
      const audio = document.getElementById('offline-audio') as HTMLAudioElement | null;
      if (audio) audio.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setCurrentId(null);
      setIsPlaying(false);
    }
  };

  const formatted = useMemo(() => items.sort((a, b) => b.downloadedAt - a.downloadedAt), [items]);

  // Allow access offline even if auth gating can't be verified
  // If online and user is not premium, gate the page
  if (navigator.onLine) {
    if (!isAuthenticated) {
      return (
        <div className="p-6 text-zinc-300">Please log in to view your downloads.</div>
      );
    }
    if (!isPremium) {
      return (
        <div className="p-6 text-zinc-300">Offline downloads are available for Premium members.</div>
      );
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
        <Download className="w-6 h-6" /> Downloads
      </h1>
      {loading ? (
        <div className="text-zinc-400">Loading…</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : formatted.length === 0 ? (
        <div className="text-zinc-400">No offline songs saved yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatted.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-white/5 rounded-lg p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                <FallbackImage src={item.coverUrl} alt={item.title} className="w-14 h-14" fallbackSeed={item.id} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{item.title}</div>
                <div className="text-sm text-zinc-400 truncate">{item.artist || 'Unknown artist'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => handlePlay(item.id)}>
                  <Play className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


