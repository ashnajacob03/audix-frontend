import { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminTopbar from '@/components/AdminTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserManagement from '@/components/admin/UserManagement';
import ArtistVerifications from '@/components/admin/ArtistVerifications';
import ArtistManagement from '../components/admin/ArtistManagement';
import {
  Shield,
  Users,
  BarChart3,
  XCircle,
  Globe,
  Crown,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useCustomAuth();
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [range, setRange] = useState('30d');

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
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/user/profile`, {
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

  // Analytics data for charts
  const [analytics, setAnalytics] = useState<any | null>(null);

  const fetchAnalytics = async () => {
    try {
      const resp = await adminApi.getAnalytics(range);
      console.log('Analytics response:', resp);
      setAnalytics(resp?.data || resp || null);
    } catch (e) {
      console.error('Failed to load analytics', e);
      setAnalytics(null);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchRecentUsers();
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, range]);

  // Stats cards removed


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
    isActive: boolean; // last seen activity indicator
    isAccountActive?: boolean; // DB account status
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

  



  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-zinc-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }


  return (
    <div className='h-screen bg-zinc-900 flex flex-col'>
      <AdminTopbar />
      <ScrollArea className='flex-1'>
        <div className="p-6 space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3"></div>

            <div className="flex flex-wrap items-center gap-3"></div>
          </div>

          {/* Navigation Tabs - neutral segmented */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-900 text-white border-emerald-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                  activeTab === 'users'
                    ? 'bg-zinc-900 text-white border-emerald-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('artist-verifications')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                  activeTab === 'artist-verifications'
                    ? 'bg-zinc-900 text-white border-emerald-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
                }`}
              >
                Artist Verifications
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                  activeTab === 'artists'
                    ? 'bg-zinc-900 text-white border-emerald-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
                }`}
              >
                Artists
              </button>
            </div>
          </div>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Time Range Selector */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users over time */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Users - 30 days</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.usersOverTime || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} name="Total" />
                        <Line type="monotone" dataKey="premium" stroke="#f59e0b" strokeWidth={2} dot={false} name="Premium" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Active users bar chart */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Daily Active Users</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.dailyActiveUsers || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                        <Bar dataKey="active" fill="#60a5fa" name="Active" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Premium vs Free pie */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Account Types</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            const summary = analytics?.accountTypeBreakdown || {};
                            const free = summary.free || 0;
                            const premium = summary.premium || 0;
                            const family = summary.family || 0;
                            const student = summary.student || 0;
                            const arr = [
                              { name: 'Free', value: free },
                              { name: 'Premium', value: premium },
                              { name: 'Family', value: family },
                              { name: 'Student', value: student }
                            ];
                            return arr.filter(s => s.value > 0).length ? arr : [
                              { name: 'Free', value: 1 },
                              { name: 'Premium', value: 1 }
                            ];
                          })()}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={90}
                          legendType="circle"
                          label
                        >
                          {['#6366f1','#f59e0b','#22c55e','#06b6d4'].map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Listening time / streams area */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Streams</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.streamsOverTime || []}>
                        <defs>
                          <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                        <Area type="monotone" dataKey="streams" stroke="#22c55e" fillOpacity={1} fill="url(#colorStreams)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Conclusions Section - Under Charts */}
              {analytics?.insights && (
                <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    Data Analysis & Conclusions
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Growth Conclusion */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        User Growth
                      </h4>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white mb-1">{analytics.insights.totalUsers}</div>
                        <div className="text-sm text-zinc-400">New users in {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}</div>
                        <div className="text-sm text-zinc-300 mt-2">
                          {analytics.insights.growthRate.startsWith('-') 
                            ? `Growth declined by ${analytics.insights.growthRate} - review acquisition strategies`
                            : `Growth increased by ${analytics.insights.growthRate} - positive trend`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Premium Conversion Conclusion */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        Premium Conversion
                      </h4>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">{analytics.insights.premiumRate}</div>
                        <div className="text-sm text-zinc-400">Premium conversion rate</div>
                        <div className="text-sm text-zinc-300 mt-2">
                          {parseFloat(analytics.insights.premiumRate) > 15 
                            ? `Strong conversion rate - premium strategy effective`
                            : `Conversion rate needs improvement - optimize premium value`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Engagement Conclusion */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        User Engagement
                      </h4>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{analytics.insights.avgDailyActive}</div>
                        <div className="text-sm text-zinc-400">Average daily active users</div>
                        <div className="text-sm text-zinc-300 mt-2">
                          {analytics.insights.avgDailyActive > 50 
                            ? `Healthy engagement levels - good user retention`
                            : `Low engagement - focus on user activation`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Account Distribution Conclusion */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        Account Distribution
                      </h4>
                      <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400 mb-1 capitalize">{analytics.insights.topAccountType}</div>
                        <div className="text-sm text-zinc-400">Dominant account type</div>
                        <div className="text-sm text-zinc-300 mt-2">
                          {analytics.insights.topAccountType === 'free' 
                            ? `Most users on free plans - focus on conversion`
                            : `Strong premium adoption - good product-market fit`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'artist-verifications' && <ArtistVerifications />}
          {activeTab === 'artists' && <ArtistManagement />}

          {/* Show original dashboard content only when dashboard tab is active */}
          {activeTab === 'dashboard' && (
            <>
          {/* Removed Quick Actions section */}

          {/* Recent Users */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-300" />
                Recent Users
              </h2>
              <button onClick={() => setActiveTab('users')} className="text-emerald-300 hover:text-white text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={`${user.id}-${index}`} className="flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center">
                        <span className="text-zinc-300 font-mono text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                          <span className="text-white font-bold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-zinc-400 text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-500 text-xs">{formatRelative(user.lastLogin)}</span>
                          {user.isEmailVerified && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-emerald-300 text-xs">Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-200 border border-zinc-700`}>
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



