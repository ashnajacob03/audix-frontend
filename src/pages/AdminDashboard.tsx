import React, { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import AdminTopbar from '@/components/AdminTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Users, 
  Music, 
  BarChart3, 
  Settings, 
  Database,
  Activity,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Server
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Mock admin stats (replace with real data from backend)
  const adminStats = [
    {
      icon: Users,
      label: "Total Users",
      value: "1,247",
      change: "+12%",
      color: "text-blue-500"
    },
    {
      icon: Music,
      label: "Total Songs",
      value: "45,892",
      change: "+8%",
      color: "text-green-500"
    },
    {
      icon: Crown,
      label: "Premium Users",
      value: "324",
      change: "+23%",
      color: "text-yellow-500"
    },
    {
      icon: Activity,
      label: "Active Sessions",
      value: "89",
      change: "+5%",
      color: "text-purple-500"
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

  const recentActivity = [
    {
      id: 1,
      action: "New user registration",
      user: "john.doe@example.com",
      time: "2 minutes ago",
      type: "user"
    },
    {
      id: 2,
      action: "Premium subscription",
      user: "jane.smith@example.com", 
      time: "15 minutes ago",
      type: "premium"
    },
    {
      id: 3,
      action: "Song upload",
      user: "artist@music.com",
      time: "1 hour ago",
      type: "content"
    },
    {
      id: 4,
      action: "System backup completed",
      user: "System",
      time: "2 hours ago",
      type: "system"
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

  return (
    <div className='h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex flex-col'>
      <AdminTopbar />
      <ScrollArea className='flex-1'>
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    Welcome to Admin Dashboard
                  </h1>
                  <p className="text-zinc-300 text-lg">
                    Hello, {userProfile?.firstName || user?.firstName || 'Administrator'}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {userProfile?.email || user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">Last login</p>
                  <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-zinc-800/60 rounded-xl p-6 hover:bg-zinc-800/80 transition-all border border-zinc-700/50 hover:border-zinc-600/50 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                      stat.color === 'text-blue-500' ? 'from-blue-500/20 to-blue-600/20' :
                      stat.color === 'text-green-500' ? 'from-green-500/20 to-green-600/20' :
                      stat.color === 'text-yellow-500' ? 'from-yellow-500/20 to-yellow-600/20' :
                      'from-purple-500/20 to-purple-600/20'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* System Status */}
            <div className="xl:col-span-2 bg-zinc-800/60 rounded-xl p-6 border border-zinc-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                System Status
              </h2>
              <div className="space-y-4">
                {systemStatus.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-700/50 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-zinc-400" />
                        <span className="text-white font-medium">{service.service}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400">Uptime: {service.uptime}</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 text-sm font-medium">Online</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-800/60 rounded-xl p-6 border border-zinc-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Manage Users</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>Content Management</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-zinc-800/60 rounded-xl p-6 border border-zinc-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-zinc-700/30 rounded-md transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'premium' ? 'bg-yellow-500' :
                    activity.type === 'content' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-zinc-400 text-xs">{activity.user}</p>
                    <p className="text-zinc-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;
