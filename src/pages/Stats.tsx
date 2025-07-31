import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Music, Clock, Heart, PlayCircle, TrendingUp } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: Music,
      label: "Total Songs Played",
      value: "1,234",
      change: "+12% this month",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      label: "Hours Listened",
      value: "156h",
      change: "+23% this month",
      color: "text-green-500"
    },
    {
      icon: Heart,
      label: "Songs Liked",
      value: "89",
      change: "+5% this month",
      color: "text-red-500"
    },
    {
      icon: PlayCircle,
      label: "Playlists Created",
      value: "12",
      change: "+2 this month",
      color: "text-purple-500"
    }
  ];

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold text-white">Your Music Stats</h1>
            </div>
            <p className="text-zinc-400">Track your listening habits and discover your music patterns</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-zinc-800/40 rounded-lg p-6 hover:bg-zinc-800/60 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    <span className="text-sm text-zinc-400">{stat.label}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-3xl font-bold text-white block">{stat.value}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">{stat.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Placeholder for charts */}
          <div className="bg-zinc-800/40 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Listening Activity</h2>
            <div className="h-64 bg-zinc-700/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400">Charts coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default Stats;