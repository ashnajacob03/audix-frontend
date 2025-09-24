import React from "react";
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

const ArtistDashboard: React.FC = () => {
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



