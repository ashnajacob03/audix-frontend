import React, { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';
import api from '../services/api';
import { useCustomAuth } from '../contexts/AuthContext';


type Track = {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
  description?: string;
};

const EmptyRow = () => (
  <div className="flex items-center justify-between py-3 px-3 rounded-lg border border-dashed border-zinc-800">
    <div className="text-sm text-zinc-400">No tracks yet</div>
  </div>
);

const ArtistMusic: React.FC = () => {
  const { user } = useCustomAuth();
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api';
  const apiOrigin = String(apiBase).replace(/\/$/, '').replace(/\/api$/, '');
  const toAbsoluteUrl = (p?: string) => (p && /^https?:\/\//i.test(p) ? p : p ? `${apiOrigin}${p}` : '');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [form, setForm] = useState<{ title: string; genre: string; description: string }>({
    title: '',
    genre: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const loadMySongs = async () => {
    try {
      const data = await api.getMySongs();
      const rows: Track[] = (data || []).map((s: any) => ({
        id: s._id,
        title: s.title,
        coverUrl: toAbsoluteUrl(s.imageUrl) || '',
        genre: Array.isArray(s.genres) && s.genres[0] ? s.genres[0] : '',
        description: s.description || '',
      }));
      setTracks(rows);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMySongs();
  }, []);

  const resetForm = () => {
    setForm({ title: '', genre: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setLoading(true);
      if (editingId) {
        const updated = await api.updateSongWithUpload(editingId, {
          title: form.title,
          genre: form.genre,
          description: form.description,
          audioFile: audioFile || undefined,
          coverFile: coverFile || undefined,
          artist: user ? `${user.firstName} ${user.lastName}` : 'Unknown Artist',
        });
        setTracks(prev => prev.map(t => t.id === editingId ? {
          id: updated._id,
          title: updated.title,
          coverUrl: toAbsoluteUrl(updated.imageUrl) || '',
          genre: Array.isArray(updated.genres) && updated.genres[0] ? updated.genres[0] : '',
          description: updated.description || '',
        } : t));
      } else {
        if (!audioFile) return; // require audio for new
        const created = await api.createSongWithUpload({
          title: form.title,
          genre: form.genre,
          description: form.description,
          audioFile,
          coverFile,
          artist: user ? `${user.firstName} ${user.lastName}` : 'Unknown Artist',
        });
        setTracks(prev => [{
          id: created._id,
          title: created.title,
          coverUrl: toAbsoluteUrl(created.imageUrl) || '',
          genre: Array.isArray(created.genres) && created.genres[0] ? created.genres[0] : '',
          description: created.description || '',
        }, ...prev]);
      }
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const t = tracks.find(x => x.id === id);
    if (!t) return;
    setForm({ title: t.title, genre: t.genre, description: t.description || '' });
    setEditingId(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSong(id);
      setTracks(prev => prev.filter(t => t.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Music</h1>
          <p className="text-sm text-zinc-400">Upload and manage your tracks</p>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Add Music</p>
          </div>
          {editingId && <span className="text-xs text-amber-400">Editing existing track</span>}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Track Title</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g. Midnight Drive" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Genre</label>
            <input className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g. Pop" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
          </div>
          <div className="xl:col-span-3 md:col-span-2 col-span-1">
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500" rows={3} placeholder="Short description, credits, mood tags..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Audio File</label>
            <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-teal-600 file:text-white file:hover:bg-teal-700 file:cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0] || null;
                setCoverFile(f);
                if (f) {
                  const reader = new FileReader();
                  reader.onload = () => setCoverPreview(reader.result as string);
                  reader.readAsDataURL(f);
                } else {
                  setCoverPreview(null);
                }
              }}
              className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-zinc-700 file:text-white file:hover:bg-zinc-600 file:cursor-pointer"
            />
            {coverPreview && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover preview" className="h-16 w-16 rounded object-cover border border-zinc-800" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 xl:col-span-3 md:col-span-2 col-span-1">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 disabled:bg-teal-900 text-white text-sm">{editingId ? 'Update Track' : (loading ? 'Uploading...' : 'Add Track')}</button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800/60">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-4 h-4 text-teal-300" />
          <p className="text-white font-medium">Your Tracks</p>
        </div>
        {tracks.length === 0 ? (
          <EmptyRow />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-zinc-400">
                  <th className="text-left font-medium py-2 px-3">Title</th>
                  <th className="text-left font-medium py-2 px-3">Genre</th>
                  <th className="text-left font-medium py-2 px-3">Description</th>
                  <th className="text-right font-medium py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map(t => (
                  <tr key={t.id} className="border-t border-zinc-800">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {t.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.coverUrl} alt={t.title} className="h-8 w-8 rounded object-cover border border-zinc-800" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-zinc-800/60 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">NA</div>
                        )}
                        <div>
                          <p className="text-white">{t.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{t.genre || '—'}</td>
                    <td className="py-3 px-3 text-zinc-300">
                      {t.description ? <span className="line-clamp-1 max-w-xs inline-block align-middle">{t.description}</span> : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleEdit(t.id)} className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistMusic;


