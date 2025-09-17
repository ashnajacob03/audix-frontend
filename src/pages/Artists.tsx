import React, { useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { useCustomAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import FallbackImage from '@/components/FallbackImage';
import { Search, Check } from 'lucide-react';

type ArtistItem = {
  name: string;
  imageUrl?: string | null;
  songCount: number;
  followerCount?: number;
  isFollowing?: boolean;
};

const ArtistsPage: React.FC = () => {
  const { isAuthenticated } = useCustomAuth();
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [busyName, setBusyName] = useState<string | null>(null);

  const debouncedSearch = useMemo(() => search, [search]);

  const formatCount = (n?: number) => {
    const num = Number(n || 0);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return `${num}`;
  };

  const fetchArtists = async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get('/music/artists', { params: { page: pg, limit: 24, search: debouncedSearch } });
      setArtists(res?.artists || []);
      setPages(res?.pagination?.pages || 1);
    } catch (e: any) {
      setError(e?.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    fetchArtists(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleFollow = async (name: string) => {
    if (!isAuthenticated || busyName) return;
    setBusyName(name);
    // Optimistic UI update
    setArtists(prev => prev.map(a => a.name === name ? { ...a, isFollowing: true, followerCount: (a.followerCount || 0) + 1 } : a));
    try {
      const resp = await apiService.followArtist(name, { suppressAuthRedirect: true } as any);
      // Use server response if provided
      if (resp && typeof resp.isFollowing === 'boolean') {
        setArtists(prev => prev.map(a => a.name === name ? { ...a, isFollowing: resp.isFollowing, followerCount: Math.max(0, (a.followerCount || 0) + (resp.isFollowing ? 0 : 0)) } : a));
      }
    } catch (e) {
      // Revert on error
      setArtists(prev => prev.map(a => a.name === name ? { ...a, isFollowing: false, followerCount: Math.max(0, (a.followerCount || 1) - 1) } : a));
    } finally {
      setBusyName(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Artists</h1>
          <p className="text-sm text-zinc-400 mt-1">Discover and follow your favorite artists</p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artists"
              className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square rounded-full bg-zinc-800/80 mb-3 ring-1 ring-white/5" />
              <div className="h-4 bg-zinc-800/80 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-800/80 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : artists.length === 0 ? (
        <div className="text-center text-zinc-400 py-16">No artists found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {artists.map((artist) => (
            <div
              key={artist.name}
              className="rounded-xl p-4 flex flex-col items-center text-center bg-gradient-to-b from-zinc-900/80 to-black/60 border border-white/5 hover:border-white/10 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 ring-1 ring-white/10">
                <FallbackImage
                  src={artist.imageUrl || ''}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  fallbackSeed={artist.name}
                />
              </div>
              <div className="font-medium truncate w-full" title={artist.name}>{artist.name}</div>
              <div className="text-sm text-zinc-400 mb-3" title={`${artist.songCount} songs • ${artist.followerCount || 0} followers`}>
                {artist.songCount} songs • {formatCount(artist.followerCount)} followers
              </div>
              {artist.isFollowing ? (
                <Button disabled className="w-full" variant="secondary">
                  <Check className="h-4 w-4 mr-1.5" /> Following
                </Button>
              ) : (
                <Button onClick={() => toggleFollow(artist.name)} disabled={busyName === artist.name} className="w-full" variant="secondary">
                  Follow
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <span className="text-sm text-zinc-400">Page {page} of {pages}</span>
        <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
      </div>
    </div>
  );
};

export default ArtistsPage;


