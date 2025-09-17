import React from "react";
import { Users, DollarSign, Globe2, PlayCircle, Radio, Activity, Music2 } from "lucide-react";

const StatCard = ({ title, value, sub, icon: Icon }: { title: string; value: string; sub: string; icon: React.ComponentType<any>; }) => (
  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-purple-300 border border-purple-700/30">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-emerald-400">{sub}</p>
    </div>
  </div>
);

const TrackRow = ({ index, title, listeners }: { index: number; title: string; listeners: number }) => (
  <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-zinc-800/50 transition">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">{index}</div>
      <div>
        <p className="text-sm text-white">{title}</p>
        <p className="text-xs text-zinc-400">Neon Dreams</p>
      </div>
    </div>
    <div className="text-sm text-zinc-400">{listeners}</div>
  </div>
);

const ArtistDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Artist Dashboard</h1>
          <p className="text-sm text-zinc-400">Welcome back, Alex Johnson</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Streams" value="2.4M" sub="+12.5% from last month" icon={PlayCircle} />
        <StatCard title="Monthly Listeners" value="187K" sub="+8.2% from last month" icon={Users} />
        <StatCard title="Total Followers" value="94.2K" sub="+15.3% from last month" icon={Activity} />
        <StatCard title="Earnings (30d)" value="$3,247" sub="+22.1% from last month" icon={DollarSign} />
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
          <div className="bg-zinc-800/60 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-700" />
              <div>
                <p className="text-sm text-white">Midnight Echoes</p>
                <p className="text-xs text-zinc-400">Neon Dreams</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl text-emerald-400 font-semibold">1,247</p>
              <p className="text-[10px] text-zinc-500">listeners</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-2">Other Active Tracks</p>
          <div className="space-y-1">
            <TrackRow index={1} title="City Lights" listeners={312} />
            <TrackRow index={2} title="Electric Pulse" listeners={298} />
            <TrackRow index={3} title="Synth Wave" listeners={209} />
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-4 h-4 text-teal-300" />
            <p className="text-white font-medium">Top 5 Countries</p>
          </div>
          <div className="space-y-4">
            {[
              { c: "United States", p: 34, v: "84.2K" },
              { c: "United Kingdom", p: 18, v: "44.6K" },
              { c: "Germany", p: 12, v: "29.8K" },
              { c: "Canada", p: 9, v: "22.3K" },
              { c: "Australia", p: 7, v: "17.4K" },
            ].map((row) => (
              <div key={row.c} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-zinc-300">{row.c}</p>
                  <p className="text-zinc-400">{row.p}% <span className="text-[10px]">· {row.v}</span></p>
                </div>
                <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600" style={{ width: `${row.p}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs text-zinc-500">Others 20% · 49.7K</div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-4 h-4 text-teal-300" />
          <p className="text-white font-medium">Overview</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Streams" value="2.4M" sub="\u00A0" icon={PlayCircle} />
          <StatCard title="Listeners" value="187K" sub="\u00A0" icon={Users} />
          <StatCard title="Followers" value="94.2K" sub="\u00A0" icon={Activity} />
          <StatCard title="Earnings" value="$3,247" sub="\u00A0" icon={DollarSign} />
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;



