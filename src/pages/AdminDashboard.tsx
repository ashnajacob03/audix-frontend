import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import AdminTopbar from '@/components/AdminTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Users,
  Music,
  BarChart3,
  Database,
  Activity,
  Crown,
  CheckCircle,
  XCircle,
  TrendingUp,
  Server,
  DollarSign,
  Download,
  Play,
  UserPlus,
  Calendar,
  Clock,
  Award,
  Zap,
  Globe,
  Filter,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bell,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Admin email from environment
  const ADMIN_EMAIL = 'ashnajacob003@gmail.com';

  useEffect(() => {
    const checkAdminAccess = () => {
      const userEmail = userProfile?.email || user?.emailAddresses[0]?.emailAddress;

      if (userEmail === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        // Redirect non-admin users to home
        navigate('/');
      }
      setLoading(false);
    };

    if (user || userProfile) {
      checkAdminAccess();
    }
  }, [user, userProfile, navigate]);

  // Enhanced mock data with professional metrics
  const enhancedStats = {
    totalUsers: 45672,
    totalSongs: 23891,
    activeUsers: 8934,
    revenue: 127450,
    newUsersToday: 342,
    songsPlayedToday: 28456,
    downloadsToday: 1247,
    premiumUsers: 5621,
    avgSessionTime: '24m 32s',
    conversionRate: 12.4,
    topGenre: 'Pop',
    serverUptime: 99.9,
    totalStreams: 1247892,
    artistCount: 2341
  };

  // Professional admin stats with enhanced metrics
  const adminStats = [
    {
      icon: Users,
      label: "Total Users",
      value: enhancedStats.totalUsers.toLocaleString(),
      change: "+12.4%",
      changeType: "positive",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: Music,
      label: "Total Songs",
      value: enhancedStats.totalSongs.toLocaleString(),
      change: "+8.7%",
      changeType: "positive",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      icon: Crown,
      label: "Premium Users",
      value: enhancedStats.premiumUsers.toLocaleString(),
      change: "+23.1%",
      changeType: "positive",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      icon: Activity,
      label: "Active Now",
      value: enhancedStats.activeUsers.toLocaleString(),
      change: "+5.2%",
      changeType: "positive",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: DollarSign,
      label: "Revenue",
      value: `$${enhancedStats.revenue.toLocaleString()}`,
      change: "+15.8%",
      changeType: "positive",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      icon: Play,
      label: "Total Streams",
      value: `${(enhancedStats.totalStreams / 1000000).toFixed(1)}M`,
      change: "+18.3%",
      changeType: "positive",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    }
  ];

  const systemStatus = [
    {
      service: "Database",
      status: "online",
      icon: Database,
      uptime: "99.9%"
    },
    {
      service: "API Server",
      status: "online", 
      icon: Server,
      uptime: "99.8%"
    },
    {
      service: "Music Streaming",
      status: "online",
      icon: Music,
      uptime: "99.7%"
    },
    {
      service: "Authentication",
      status: "online",
      icon: Shield,
      uptime: "100%"
    }
  ];

  const recentUsers = [
    {
      id: 1,
      name: 'Alexandra Chen',
      email: 'alex.chen@example.com',
      joinDate: '2024-01-15',
      status: 'Premium',
      avatar: 'AC',
      lastActive: '2 min ago',
      totalPlays: 1247,
      country: 'US'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      email: 'marcus.j@example.com',
      joinDate: '2024-01-14',
      status: 'Active',
      avatar: 'MJ',
      lastActive: '1 hour ago',
      totalPlays: 892,
      country: 'CA'
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      email: 'sofia.r@example.com',
      joinDate: '2024-01-13',
      status: 'Premium',
      avatar: 'SR',
      lastActive: '5 min ago',
      totalPlays: 2341,
      country: 'ES'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@example.com',
      joinDate: '2024-01-12',
      status: 'Active',
      avatar: 'DK',
      lastActive: '3 hours ago',
      totalPlays: 567,
      country: 'KR'
    },
  ];

  const topSongs = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Luna Eclipse',
      plays: 45420,
      downloads: 2892,
      genre: 'Electronic',
      duration: '3:42',
      trending: true,
      revenue: 4542
    },
    {
      id: 2,
      title: 'Golden Hour',
      artist: 'Sunset Vibes',
      plays: 38340,
      downloads: 2143,
      genre: 'Pop',
      duration: '4:15',
      trending: true,
      revenue: 3834
    },
    {
      id: 3,
      title: 'Ocean Waves',
      artist: 'Coastal Dreams',
      plays: 32876,
      downloads: 1821,
      genre: 'Ambient',
      duration: '5:23',
      trending: false,
      revenue: 3287
    },
    {
      id: 4,
      title: 'City Lights',
      artist: 'Urban Pulse',
      plays: 28765,
      downloads: 1534,
      genre: 'Hip-Hop',
      duration: '3:28',
      trending: true,
      revenue: 2876
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New premium subscription",
      user: "alexandra.chen@example.com",
      time: "2 minutes ago",
      type: "premium",
      icon: Crown,
      color: "text-yellow-500"
    },
    {
      id: 2,
      action: "Song uploaded",
      user: "luna.eclipse@artist.com",
      time: "15 minutes ago",
      type: "content",
      icon: Music,
      color: "text-green-500"
    },
    {
      id: 3,
      action: "New user registration",
      user: "marcus.johnson@example.com",
      time: "1 hour ago",
      type: "user",
      icon: UserPlus,
      color: "text-blue-500"
    },
    {
      id: 4,
      action: "System backup completed",
      user: "System",
      time: "2 hours ago",
      type: "system",
      icon: Database,
      color: "text-purple-500"
    },
    {
      id: 5,
      action: "Revenue milestone reached",
      user: "System",
      time: "3 hours ago",
      type: "milestone",
      icon: Award,
      color: "text-emerald-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-zinc-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className='h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex flex-col'>
      <AdminTopbar />
      <ScrollArea className='flex-1'>
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-zinc-400 text-lg">Real-time insights and analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Last updated: Just now</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Global</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl px-4 py-3">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50 text-zinc-300 hover:text-white rounded-xl transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25">
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                <BarChart3 className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminStats.map((stat, index) => (
              <div key={index} className={`relative overflow-hidden ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-6 group hover:scale-105 transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                      <span className="text-zinc-500 text-sm">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-500" />
                Quick Actions
              </h2>
              <button className="text-zinc-400 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30 rounded-xl transition-all duration-200 group">
                <UserPlus className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span className="text-blue-400 group-hover:text-blue-300 font-medium">Add New User</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-600/20 to-purple-700/20 hover:from-purple-600/30 hover:to-purple-700/30 border border-purple-500/30 rounded-xl transition-all duration-200 group">
                <Music className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                <span className="text-purple-400 group-hover:text-purple-300 font-medium">Upload Song</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-600/20 to-green-700/20 hover:from-green-600/30 hover:to-green-700/30 border border-green-500/30 rounded-xl transition-all duration-200 group">
                <TrendingUp className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                <span className="text-green-400 group-hover:text-green-300 font-medium">View Analytics</span>
              </button>
              <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 hover:from-yellow-600/30 hover:to-yellow-700/30 border border-yellow-500/30 rounded-xl transition-all duration-200 group">
                <DollarSign className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-yellow-400 group-hover:text-yellow-300 font-medium">Revenue Report</span>
              </button>
            </div>
          </div>

          {/* Data Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  Recent Users
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors">
                    <Search className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors">
                    <Filter className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
                </div>
              </div>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-700/20 hover:bg-zinc-700/40 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">{user.avatar}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-blue-300 transition-colors">{user.name}</p>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-500 text-xs">{user.country}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500 text-xs">{user.totalPlays} plays</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Premium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        user.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {user.status}
                      </span>
                      <p className="text-zinc-400 text-xs mt-2">{user.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Songs */}
            <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Music className="w-5 h-5 text-green-400" />
                  Top Songs
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors">
                    <TrendingUp className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="text-green-400 hover:text-green-300 text-sm font-medium">View All</button>
                </div>
              </div>
              <div className="space-y-3">
                {topSongs.map((song, index) => (
                  <div key={song.id} className="flex items-center justify-between p-4 bg-zinc-700/20 hover:bg-zinc-700/40 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium group-hover:text-green-300 transition-colors">{song.title}</p>
                          {song.trending && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                              <TrendingUp className="w-3 h-3 text-red-400" />
                              <span className="text-red-400 text-xs font-medium">Trending</span>
                            </div>
                          )}
                        </div>
                        <p className="text-zinc-400 text-sm">{song.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-500 text-xs">{song.genre}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500 text-xs">{song.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">{song.plays.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4 text-blue-400" />
                        <span className="text-zinc-400">{song.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">${song.revenue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - Activity & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Recent Activity
                </h2>
                <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium">
                  <Bell className="w-4 h-4" />
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-zinc-700/20 hover:bg-zinc-700/40 rounded-xl transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-500', '-500/20')} border ${activity.color.replace('text-', 'border-').replace('-500', '-500/30')}`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium group-hover:text-zinc-100 transition-colors">{activity.action}</p>
                      <p className="text-zinc-400 text-sm">{activity.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500 text-sm">{activity.time}</p>
                      <span className={`inline-block w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Server className="w-5 h-5 text-green-400" />
                  System Status
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
                </div>
              </div>
              <div className="space-y-4">
                {systemStatus.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-700/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                        <system.icon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{system.service}</p>
                        <p className="text-zinc-400 text-sm">Uptime: {system.uptime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium capitalize">{system.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-zinc-700/50">
                <h3 className="text-white font-medium mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Server Response Time</span>
                    <span className="text-green-400 text-sm font-medium">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Memory Usage</span>
                    <span className="text-yellow-400 text-sm font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">CPU Usage</span>
                    <span className="text-green-400 text-sm font-medium">23%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Active Connections</span>
                    <span className="text-blue-400 text-sm font-medium">1,247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;



