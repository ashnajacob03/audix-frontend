import React, { useState } from "react";
import { Users, DollarSign, Globe2, PlayCircle, Radio, Activity, Music2 } from "lucide-react";

const StatCard = ({ title, icon: Icon }: { title: string; icon: React.ComponentType<any>; }) => (
  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-purple-300 border border-purple-700/30">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-sm text-zinc-500">No data yet</p>
    </div>
  </div>
);

const EmptyRow = () => (
  <div className="flex items-center justify-between py-3 px-3 rounded-lg border border-dashed border-zinc-800">
    <div className="text-sm text-zinc-400">No tracks yet</div>
  </div>
);

type Track = {
  id: string;
  title: string;
  album: string;
  coverUrl: string;
  genre: string;
  releaseDate: string; // ISO string
  explicit: boolean;
  description?: string;
};

const ArtistDashboard: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [form, setForm] = useState<Omit<Track, "id">>({
    title: "",
    album: "",
    coverUrl: "",
    genre: "",
    releaseDate: "",
    explicit: false,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      title: "",
      album: "",
      coverUrl: "",
      genre: "",
      releaseDate: "",
      explicit: false,
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      setTracks(prev => prev.map(t => (t.id === editingId ? { id: editingId, ...form } : t)));
    } else {
      const newTrack: Track = { id: String(Date.now()), ...form };
      setTracks(prev => [newTrack, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const t = tracks.find(x => x.id === id);
    if (!t) return;
    const { id: _id, ...rest } = t;
    setForm(rest);
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Artist Dashboard</h1>
          <p className="text-sm text-zinc-400">Track your performance at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Streams" icon={PlayCircle} />
        <StatCard title="Monthly Listeners" icon={Users} />
        <StatCard title="Total Followers" icon={Activity} />
        <StatCard title="Earnings (30d)" icon={DollarSign} />
      </div>

      {/* Add Music */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Add Music</p>
          </div>
          {editingId && (
            <span className="text-xs text-amber-400">Editing existing track</span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Track Title</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. Midnight Drive"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Album</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. City Lights"
              value={form.album}
              onChange={e => setForm({ ...form, album: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cover URL</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="https://..."
              value={form.coverUrl}
              onChange={e => setForm({ ...form, coverUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Genre</label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. Pop"
              value={form.genre}
              onChange={e => setForm({ ...form, genre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Release Date</label>
            <input
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={form.releaseDate}
              onChange={e => setForm({ ...form, releaseDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              id="explicit"
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-teal-500"
              checked={form.explicit}
              onChange={e => setForm({ ...form, explicit: e.target.checked })}
            />
            <label htmlFor="explicit" className="text-sm text-zinc-300">Explicit content</label>
          </div>
          <div className="xl:col-span-3 md:col-span-2 col-span-1">
            <label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows={3}
              placeholder="Short description, credits, mood tags..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 xl:col-span-3 md:col-span-2 col-span-1">
            <button type="submit" className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-sm">
              {editingId ? "Update Track" : "Add Track"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800/60">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Your Tracks */}
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
                  <th className="text-left font-medium py-2 px-3">Album</th>
                  <th className="text-left font-medium py-2 px-3">Genre</th>
                  <th className="text-left font-medium py-2 px-3">Release</th>
                  <th className="text-left font-medium py-2 px-3">Explicit</th>
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
                          {t.description && <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{t.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{t.album || "—"}</td>
                    <td className="py-3 px-3 text-zinc-300">{t.genre || "—"}</td>
                    <td className="py-3 px-3 text-zinc-300">{t.releaseDate || "—"}</td>
                    <td className="py-3 px-3 text-zinc-300">{t.explicit ? "Yes" : "No"}</td>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-300" />
              <p className="text-white font-medium">Now Playing</p>
            </div>
            <span className="text-xs text-zinc-400">Total Listeners</span>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-4 mb-4 text-sm text-zinc-400">No currently playing data</div>
          <p className="text-xs text-zinc-400 mb-2">Active Tracks</p>
          <div className="space-y-1">
            <EmptyRow />
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Top 5 Countries</p>
          </div>
          <div className="text-sm text-zinc-400">No geographic data yet</div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-4 h-4 text-teal-300" />
          <p className="text-white font-medium">Overview</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Streams" icon={PlayCircle} />
          <StatCard title="Listeners" icon={Users} />
          <StatCard title="Followers" icon={Activity} />
          <StatCard title="Earnings" icon={DollarSign} />
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;



