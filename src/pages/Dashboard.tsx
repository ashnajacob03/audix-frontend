import { useUser } from '@clerk/clerk-react';
import AudixTopbar from '@/components/AudixTopbar';
import UserAvatar from '@/components/UserAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Music, Heart, BarChart3, Clock, PlayCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

const Dashboard = () => {
  const { user } = useUser();
  const { userProfile, isLoading } = useUserProfile();

  // Mock data for user stats
  const userStats = [
    {
      icon: Music,
      label: "Songs Played",
      value: "1,234",
      change: "+12%"
    },
    {
      icon: Heart,
      label: "Liked Songs",
      value: "89",
      change: "+5%"
    },
    {
      icon: Clock,
      label: "Hours Listened",
      value: "156",
      change: "+23%"
    },
    {
      icon: PlayCircle,
      label: "Playlists",
      value: "12",
      change: "+2%"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Liked",
      song: "Blinding Lights",
      artist: "The Weeknd",
      time: "2 hours ago"
    },
    {
      id: 2,
      action: "Added to playlist",
      song: "Watermelon Sugar",
      artist: "Harry Styles",
      time: "5 hours ago"
    },
    {
      id: 3,
      action: "Played",
      song: "Levitating",
      artist: "Dua Lipa",
      time: "1 day ago"
    }
  ];

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <UserAvatar size="2xl" showOnlineStatus={true} />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {userProfile?.firstName || user?.firstName || 'Music Lover'}!
                </h1>
                <p className="text-zinc-400">
                  {userProfile?.email || user?.emailAddresses[0]?.emailAddress}
                </p>
                {isLoading && (
                  <p className="text-xs text-zinc-500">Loading profile...</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {userStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-zinc-800/40 rounded-lg p-4 hover:bg-zinc-800/60 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-zinc-400">{stat.label}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-green-500">{stat.change}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 bg-zinc-800/40 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Full Name</span>
                  <span className="text-white">
                    {userProfile?.fullName || user?.fullName || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Email</span>
                  <span className="text-white">
                    {userProfile?.email || user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-700/50">
                  <span className="text-zinc-400">User ID</span>
                  <span className="text-white font-mono text-sm">{user?.id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-zinc-400">Account Status</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-800/40 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-zinc-700/30 rounded-md transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        <span className="text-green-500">{activity.action}</span> {activity.song}
                      </p>
                      <p className="text-zinc-400 text-xs">by {activity.artist}</p>
                      <p className="text-zinc-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-zinc-800/40 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Create Playlist
              </button>
              <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Browse Music
              </button>
              <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                View Liked Songs
              </button>
              <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default Dashboard;