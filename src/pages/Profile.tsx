import { useEffect, useMemo, useState } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import AudixTopbar from '@/components/AudixTopbar';
import UserAvatar from '@/components/UserAvatar';
import UserProfileModal from '@/components/UserProfileModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Music, Heart, BarChart3, Clock, PlayCircle, MessageCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useCustomAuth();
  const { userProfile, isLoading } = useUserProfile();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState<boolean>(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const API_BASE_URL = useMemo(() => ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api'), []);

  type StatItem = { icon: any; label: string; value: string | number; change?: string | null };
  const [userStats, setUserStats] = useState<StatItem[]>([
    { icon: Music, label: 'Songs Played', value: '-' },
    { icon: Heart, label: 'Liked Songs', value: '-' },
    { icon: Clock, label: 'Hours Listened', value: '-' },
    { icon: PlayCircle, label: 'Playlists', value: '-' },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/user/stats`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch user stats');
        const data = await res.json();
        const s = data?.data?.stats || {};

        setUserStats([
          { icon: Music, label: 'Songs Played', value: s.playCount ?? '-' },
          { icon: Heart, label: 'Liked Songs', value: s.likedSongsCount ?? 0 },
          { icon: Clock, label: 'Hours Listened', value: s.hoursListened ?? '-' },
          { icon: PlayCircle, label: 'Playlists', value: s.playlistsCount ?? 0 },
        ]);
      } catch (e) {
        // keep defaults on error
      }
    };
    loadStats();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setIsActivityLoading(true);
        setActivityError(null);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsActivityLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        const notifications = (data?.data?.notifications || []) as any[];
        const mapped = notifications.map((n: any) => ({
          id: n._id,
          action: n.title || n.type,
          song: n.message,
          artist: n?.sender ? `${n.sender.firstName || ''} ${n.sender.lastName || ''}`.trim() : 'System',
          time: new Date(n.createdAt).toLocaleString(),
        }));
        setRecentActivity(mapped);
      } catch (e: any) {
        setActivityError(e?.message || 'Something went wrong');
      } finally {
        setIsActivityLoading(false);
      }
    };

    fetchActivity();
  }, [API_BASE_URL]);

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
                  {userProfile?.firstName || user?.firstName || 'Music Lover'}
                </h1>
                <p className="text-zinc-400">
                  {userProfile?.email || user?.email}
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
                    {userProfile?.email || user?.email}
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
                {isActivityLoading && (
                  <div className="text-sm text-zinc-400">Loading activity...</div>
                )}
                {activityError && (
                  <div className="text-sm text-red-400">{activityError}</div>
                )}
                {!isActivityLoading && !activityError && recentActivity.length === 0 && (
                  <div className="text-sm text-zinc-400">No recent activity yet.</div>
                )}
                {!isActivityLoading && !activityError && recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-zinc-700/30 rounded-md transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        <span className="text-green-500">{activity.action}</span> {activity.song}
                      </p>
                      <p className="text-zinc-400 text-xs">{activity.artist}</p>
                      <p className="text-zinc-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </ScrollArea>
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </main>
  );
};

export default Profile;