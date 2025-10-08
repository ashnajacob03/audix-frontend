import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { useCustomAuth } from '@/contexts/AuthContext';
import { Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AudienceData = {
  followersCount: number;
  followersOverTime: Array<{ date: string; followers: number }>;
  recentFollowers: Array<{ name: string; picture?: string | null; followedAt?: string | null }>
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) => (
  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-600/30 to-emerald-600/20 text-teal-300 border border-teal-700/30">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ArtistAudience: React.FC = () => {
  const { user } = useCustomAuth();
  const [data, setData] = useState<AudienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const artistName = `${firstName} ${lastName}`.trim() || 'Artist';
        const resp = await api.getArtistAnalytics(artistName);
        if (resp?.success && resp?.data?.audience) {
          setData(resp.data.audience);
        } else {
          setError('Failed to load audience data');
        }
      } catch (e) {
        setError('Failed to load audience data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Audience</h1>
        <p className="text-sm text-zinc-400">Understand your listeners and followers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Followers" value={data?.followersCount || 0} icon={Users} />
        <StatCard title="Growth (12m)" value="Trend" icon={TrendingUp} />
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-teal-300" />
          <p className="text-white font-medium">Followers Over Time</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.followersOverTime || []}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, color: '#F9FAFB' }} />
              <Area type="monotone" dataKey="followers" stroke="#06B6D4" fillOpacity={1} fill="url(#colorFollowers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <p className="text-white font-medium mb-4">Recent Followers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data?.recentFollowers || []).map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40">
              {f.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.picture} alt={f.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">{(f.name || 'U')[0]}</div>
              )}
              <div className="flex-1">
                <p className="text-white text-sm">{f.name}</p>
                {f.followedAt && <p className="text-xs text-zinc-400">Joined {new Date(f.followedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
          {(data?.recentFollowers?.length || 0) === 0 && (
            <p className="text-sm text-zinc-400">No followers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistAudience;


