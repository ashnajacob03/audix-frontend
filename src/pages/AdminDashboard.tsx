import { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminTopbar from '@/components/AdminTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserManagement from '@/components/admin/UserManagement';
import {
  Shield,
  Users,
  BarChart3,
  Activity,
  Crown,
  XCircle,
  UserPlus,
  Clock,
  Zap,
  Globe,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useCustomAuth();
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Admin email from environment
  const ADMIN_EMAIL = 'ashnajacob003@gmail.com';

  useEffect(() => {
    const checkAdminAccess = async () => {
      const userEmail = userProfile?.email || user?.email;
      const accessToken = localStorage.getItem('accessToken');

      // Check if user has valid token
      if (!accessToken) {
        console.log('No access token found, redirecting to login');
        navigate('/login');
        return;
      }

      // Check if user is admin
      if (userEmail === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        // Also check MongoDB admin status
        try {
          const response = await fetch('http://localhost:3002/api/user/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user?.isAdmin) {
              setIsAuthorized(true);
            } else {
              console.log('User is not admin, redirecting to home');
              navigate('/');
            }
          } else if (response.status === 401) {
            console.log('Token expired or invalid, redirecting to login');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          } else {
            console.log('Failed to verify admin status, redirecting to home');
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          navigate('/');
        }
      }
      setLoading(false);
    };

    if (user || userProfile) {
      checkAdminAccess();
    }
  }, [user, userProfile, navigate]);

  // Live dashboard stats
  const [dashboardStats, setDashboardStats] = useState<{
    users: { total: number; premium: number; newToday: number; activeToday: number };
    revenue: { monthly: number; growthRate: number };
    engagement: { totalStreams: number; avgSessionTime: string };
  } | null>(null);

  const fetchDashboardStats = async () => {
    try {
      const resp = await adminApi.getDashboardStats();
      // adminApi returns inner data, so resp = { stats }
      setDashboardStats(resp.stats);
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardStats();
      fetchRecentUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  // Minimal admin stats - only what's actually available from backend
  const adminStats = [
    {
      icon: Users,
      label: "Total Users",
      value: (dashboardStats?.users.total ?? 0).toLocaleString(),
      change: "—",
      changeType: "neutral",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: Crown,
      label: "Premium Users",
      value: (dashboardStats?.users.premium ?? 0).toLocaleString(),
      change: "—",
      changeType: "neutral",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      icon: Activity,
      label: "Active Today",
      value: (dashboardStats?.users.activeToday ?? 0).toLocaleString(),
      change: "—",
      changeType: "neutral",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: UserPlus,
      label: "New Today",
      value: (dashboardStats?.users.newToday ?? 0).toLocaleString(),
      change: "—",
      changeType: "neutral",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    }
  ];


  type AdminUserListItem = {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    accountType: 'free' | 'premium' | 'family' | 'student';
    isEmailVerified: boolean;
    isAdmin: boolean;
    joinedAt: string;
    lastLogin: string;
    isActive: boolean;
  };

  const [recentUsers, setRecentUsers] = useState<AdminUserListItem[]>([]);

  const fetchRecentUsers = async () => {
    try {
      const resp = await adminApi.getUsers({ page: 1, limit: 5 });
      setRecentUsers(resp.users);
    } catch (e) {
      console.error('Failed to load recent users', e);
    }
  };

  const formatRelative = (date?: string) => {
    if (!date) return '—';
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    return `${days} d ago`;
  };

  const generateCSVReport = async () => {
    try {
      // Fetch all users for the report
      const response = await adminApi.getUsers({ page: 1, limit: 1000 }); // Get up to 1000 users
      const users = response.users;

      // Prepare CSV headers
      const headers = [
        'ID',
        'Name',
        'Email',
        'Account Type',
        'Email Verified',
        'Is Admin',
        'Joined Date',
        'Last Login',
        'Is Active'
      ];

      // Prepare CSV data
      const csvData = users.map(user => [
        user.id || '',
        user.name || '',
        user.email || '',
        user.accountType || '',
        user.isEmailVerified ? 'Yes' : 'No',
        user.isAdmin ? 'Yes' : 'No',
        user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '',
        user.isActive ? 'Yes' : 'No'
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `user-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('CSV report generated successfully');
    } catch (error) {
      console.error('Error generating CSV report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };



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
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
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
              {activeTab === 'dashboard' && (
                <>
                  <button 
                    onClick={generateCSVReport}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Generate Report
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs - Only functional features */}
          <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
            </div>
          </div>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminStats.map((stat, index) => (
                  <div key={index} className={`relative overflow-hidden ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-6 group hover:scale-105 transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-400">
                            {stat.change}
                          </span>
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
            </>
          )}

          {activeTab === 'users' && <UserManagement />}

          {/* Show original dashboard content only when dashboard tab is active */}
          {activeTab === 'dashboard' && (
            <>
          {/* Quick Actions - Only functional */}
          <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-500" />
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab('users')}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30 rounded-xl transition-all duration-200 group"
              >
                <Users className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                <span className="text-blue-400 group-hover:text-blue-300 font-medium">Manage Users</span>
              </button>
            </div>
          </div>

          {/* Recent Users - Only functional data */}
          <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                Recent Users
              </h2>
              <button onClick={() => setActiveTab('users')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={`${user.id}-${index}`} className="flex items-center justify-between p-4 bg-zinc-700/20 hover:bg-zinc-700/40 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-300 font-mono text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                          <span className="text-white font-bold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-blue-300 transition-colors">{user.name}</p>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-500 text-xs">{formatRelative(user.lastLogin)}</span>
                          {user.isEmailVerified && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-green-400 text-xs">Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.accountType === 'premium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        user.accountType === 'family' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        user.accountType === 'student' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                      }`}>
                        {user.accountType}
                      </span>
                      <p className="text-zinc-400 text-xs mt-2">{formatRelative(user.lastLogin)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No recent users found</p>
                </div>
              )}
            </div>
          </div>

            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;



