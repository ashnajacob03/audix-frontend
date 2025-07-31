import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Plus, Play } from 'lucide-react';

const Playlists = () => {
  // Mock playlists data
  const playlists = [
    {
      id: 1,
      title: "My Favorites",
      description: "All my favorite songs in one place",
      songCount: 45,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 2,
      title: "Workout Mix",
      description: "High energy songs for the gym",
      songCount: 32,
      color: "from-red-500 to-pink-600"
    },
    {
      id: 3,
      title: "Chill Vibes",
      description: "Relaxing music for studying",
      songCount: 28,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 4,
      title: "Road Trip",
      description: "Perfect songs for long drives",
      songCount: 67,
      color: "from-orange-500 to-yellow-600"
    }
  ];

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </div>
            <p className="text-zinc-400">Manage and organize your music collections</p>
          </div>

          {/* Playlists Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-zinc-800/40 rounded-lg p-4 hover:bg-zinc-800/60 transition-colors group cursor-pointer">
                <div className="relative mb-4">
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center`}>
                    <Music className="w-16 h-16 text-white" />
                  </div>
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </button>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-1 truncate">{playlist.title}</h3>
                  <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                  <p className="text-zinc-500 text-xs">{playlist.songCount} songs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default Playlists;