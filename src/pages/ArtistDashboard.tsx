import React, { useState, useEffect } from "react";
import { Users, DollarSign, Globe2, PlayCircle, Radio, Activity, Music2, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useCustomAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, icon: Icon, change, changeType }: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<any>; 
  change?: string;
  changeType?: 'positive' | 'negative';
}) => (
  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-purple-300 border border-purple-700/30">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          {changeType === 'positive' ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        </div>
      )}
    </div>
  </div>
);

type AnalyticsData = {
  overview: {
    totalStreams: number;
    monthlyListeners: number;
    totalFollowers: number;
    earnings30d: number;
    totalSongs: number;
  };
  charts: {
    uploadsOverTime: Array<{ date: string; uploads: number }>;
    topCountries: Array<{ country: string; streams: number; percentage: number }>;
    topSongs: Array<{ title: string; streams: number; imageUrl?: string }>;
    genreBreakdown: Array<{ genre: string; streams: number }>;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
};

const ArtistDashboard: React.FC = () => {
  const { user } = useCustomAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the user's full name as artist name (matches how songs are stored)
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        const artistName = `${firstName} ${lastName}`.trim() || 'Artist';
        const response = await api.getArtistAnalytics(artistName);
        
        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          setError('Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Total Streams" 
          value={formatNumber(analyticsData?.overview.totalStreams || 0)}
          icon={PlayCircle}
          change="+12.5%"
          changeType="positive"
        />
        <StatCard 
          title="Monthly Listeners" 
          value={formatNumber(analyticsData?.overview.monthlyListeners || 0)}
          icon={Users}
          change="+8.2%"
          changeType="positive"
        />
        <StatCard 
          title="Total Followers" 
          value={formatNumber(analyticsData?.overview.totalFollowers || 0)}
          icon={Activity}
          change="+15.3%"
          changeType="positive"
        />
        <StatCard 
          title="Earnings (30d)" 
          value={formatCurrency(analyticsData?.overview.earnings30d || 0)}
          icon={DollarSign}
          change="+22.1%"
          changeType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Uploads Over Time (real data) */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Uploads Over Time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.charts.uploadsOverTime || []}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  // labels like 'Oct '25'
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorUploads)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Countries Chart (hide when no data) */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Top Countries</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(analyticsData?.charts.topCountries || []).slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis 
                  dataKey="country" 
                  type="category" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="streams" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Songs */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Top Songs</p>
          </div>
          <div className="space-y-3">
            {analyticsData?.charts.topSongs.map((song, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{song.title}</p>
                  <p className="text-xs text-zinc-400">{formatNumber(song.streams)} streams</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown (computed from available songs) */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Genre Breakdown</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(analyticsData?.charts.genreBreakdown || []).slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ genre, percent }: any) => `${genre} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="streams"
                >
                  {(analyticsData?.charts.genreBreakdown || []).slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-teal-300" />
          <p className="text-white font-medium">Recent Activity</p>
        </div>
        <div className="space-y-3">
          {analyticsData?.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ArtistDashboard;



