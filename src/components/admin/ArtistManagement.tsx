import { useEffect, useState } from 'react';
import adminApi from '@/services/adminApi';
import { BarChart3 } from 'lucide-react';
import FallbackImage from '@/components/FallbackImage';
import api from '@/services/api';

type Artist = {
  id: string;
  name: string;
  imageUrl?: string | null;
  followerCount?: number;
  createdAt?: string;
};

const ArtistManagement = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      // List artists that actually have songs (public endpoint)
      const res = await api.get('/music/artists', { params: { page, limit: 12, search } });
      const list = res?.data?.artists || res?.artists || [];
      const pagination = res?.data?.pagination || res?.pagination;
      setArtists(list.map((a: any) => ({ id: a.id || a._id || a.name, name: a.name, imageUrl: a.imageUrl, followerCount: a.followerCount })));
      setPages((pagination?.pages) || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const submit = async () => {
    if (!form) return;
    try {
      setBusyId(form.id);
      await adminApi.updateArtist(form.id, { name: form.name, imageUrl: form.imageUrl || null });
      setForm(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    try {
      setBusyId(id);
      await adminApi.deleteArtist(id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search artists"
            className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-700"
          />
        </div>
        <button
          onClick={() => {
            const headers = ['ID','Name','Followers'];
            const rows = artists.map(a => [a.id, a.name, String(a.followerCount ?? 0)]);
            const csv = [headers.join(','), ...rows.map(r => r.map(f => `"${(f ?? '').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `artists-report-page-${page}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-200"
        >
          <BarChart3 className="w-4 h-4" />
          Generate Report
        </button>
        {form && (
          <div className="flex items-center gap-2">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Artist name"
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-700"
            />
            <input
              value={form.imageUrl || ''}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="Image URL (optional)"
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-700 w-64"
            />
            <button onClick={submit} disabled={!!busyId} className="px-3 py-2 rounded-md border border-emerald-800 text-zinc-100 hover:bg-zinc-900 disabled:opacity-50">
              {busyId ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setForm(null)} className="px-3 py-2 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-900">Cancel</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
          ))
        ) : artists.length === 0 ? (
          <div className="col-span-full text-zinc-400">No artists found</div>
        ) : (
          artists.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  {(/^https?:\/\//i.test(a.imageUrl || '')) ? (
                    <FallbackImage src={a.imageUrl as string} alt={a.name} className="w-12 h-12 object-cover" />
                  ) : (
                    <span className="text-zinc-300 font-semibold">{a.name.split(' ').map(n => n[0]).join('')}</span>
                  )}
                </div>
                <div>
                  <p className="text-zinc-100 font-medium">{a.name}</p>
                  <p className="text-zinc-500 text-sm">{(a.followerCount || 0).toLocaleString()} followers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm({ id: a.id, name: a.name, imageUrl: a.imageUrl || '' })} className="px-2 py-1 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm">Edit</button>
                <button onClick={() => remove(a.id)} disabled={busyId === a.id} className="px-2 py-1 rounded-md border border-zinc-800 text-red-300 hover:bg-zinc-800 text-sm disabled:opacity-50">{busyId === a.id ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">Prev</button>
          <span className="text-zinc-400 text-sm">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))} className="px-3 py-1 rounded-md border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default ArtistManagement;


