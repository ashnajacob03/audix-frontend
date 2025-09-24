import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Plus, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const Playlists = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const { playQueue } = useAudioPlayer();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');

  const gradientColors = useMemo(
    () => [
      'from-green-500 to-emerald-600',
      'from-red-500 to-pink-600',
      'from-blue-500 to-cyan-600',
      'from-orange-500 to-yellow-600',
      'from-purple-500 to-fuchsia-600',
      'from-teal-500 to-cyan-600',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-blue-600',
    ],
    []
  );

  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlaylists({ suppressAuthRedirect: true, params: { scope: 'mine' } } as any);
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load playlists');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreate = async () => {
    const cleaned = newPlaylistName.replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    setCreating(true);
    setError(null);
    try {
      await api.createPlaylist({ name: cleaned, title: cleaned }, { suppressAuthRedirect: true } as any);
      setNewPlaylistName('');
      await loadPlaylists();
    } catch (e: any) {
      setError(e?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Playlist name"
                  className="flex-1 sm:flex-initial bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-white/20"
                  aria-label="Playlist name"
                />
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleCreate}
                  disabled={creating || !newPlaylistName.trim()}
                >
                  <Plus className="w-4 h-4" />
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
            {error ? <p className="text-red-400 text-sm mb-2">{error}</p> : null}
            <p className="text-zinc-400">Manage and organize your music collections</p>
          </div>

          {/* Playlists Grid */}
          {loading ? (
            <div className="text-zinc-400">Loading playlists…</div>
          ) : playlists.length === 0 ? (
            <div className="text-zinc-400">No playlists yet. Create your first playlist above.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {playlists.map((playlist, idx) => (
                <div key={playlist._id || idx} className="bg-zinc-800/40 rounded-lg p-4 hover:bg-zinc-800/60 transition-colors group cursor-pointer">
                  <div className="relative mb-4">
                    <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${gradientColors[idx % gradientColors.length]} flex items-center justify-center`}>
                      <Music className="w-16 h-16 text-white" />
                    </div>
                    <button
                      className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          // Ensure we have fresh playlist with songs populated
                          const full = await api.getPlaylist(playlist._id, { suppressAuthRedirect: true } as any);
                          const songs = Array.isArray(full?.songs)
                            ? full.songs
                                .filter((s: any) => s && s.song)
                                .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
                                .map((s: any) => ({
                                  _id: s.song._id,
                                  title: s.song.title,
                                  artist: s.song.artist,
                                  imageUrl: s.song.imageUrl,
                                  duration: s.song.duration,
                                  previewUrl: s.song.previewUrl,
                                }))
                            : [];
                          if (songs.length > 0) {
                            playQueue(songs, 0, 'playlist');
                          }
                        } catch (err) {
                          // no-op
                        }
                      }}
                    >
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 truncate">{playlist.name}</h3>
                    {playlist.description ? (
                      <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                    ) : (
                      <p className="text-zinc-500 text-sm mb-2">—</p>
                    )}
                    <p className="text-zinc-500 text-xs">{playlist.songCount ?? (playlist.songs?.length || 0)} songs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default Playlists;