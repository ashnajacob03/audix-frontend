import { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Play,
  Crown,
  Globe,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  timeRange: string;
  period: {
    start: string;
    end: string;
  };
  users: {
    new: number;
    active: number;
    premium: number;
    newGrowthRate?: number;
    activeGrowthRate?: number;
    premiumGrowthRate?: number;
    total?: number;
    totalGrowthRate?: number;
  };
  conversations: {
    conversations: number;
    messages: number;
    messagesGrowthRate?: number;
  };
  content: {
    conversations: number;
    messages: number;
    messagesGrowthRate?: number;
  };
  revenue?: {
    total: number;
    monthly: number;
    growthRate?: number;
  };
  streams?: {
    total: number;
    monthly: number;
    growthRate?: number;
  };
  engagement?: {
    likes: number;
    shares: number;
    avgSessionTime?: string;
    sessionGrowthRate?: number;
  };
  dailyStats: Array<{
    date: string;
    newUsers: number;
    messages: number;
    activeUsers: number;
  }>;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics(timeRange);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Analytics
            </h2>
            <p className="text-zinc-400 mt-1">Detailed insights and metrics</p>
          </div>
        </div>
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-700/50 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-700/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Analytics
          </h2>
          <p className="text-zinc-400 mt-1">Detailed insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 text-zinc-300 hover:text-white rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Time Range Info */}
      <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-white font-medium">{getTimeRangeLabel(timeRange)}</h3>
              <p className="text-zinc-400 text-sm">
                {analytics?.period.start && analytics?.period.end && (
                  `${new Date(analytics.period.start).toLocaleDateString()} - ${new Date(analytics.period.end).toLocaleDateString()}`
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Live Data</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">New Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(analytics?.users.new || 0)}</p>
              <div className="flex items-center gap-2 mt-2">
                {analytics?.users.newGrowthRate ? (
                  <>
                    {getGrowthIcon(analytics.users.newGrowthRate)}
                    <span className={`text-sm font-medium ${getGrowthColor(analytics.users.newGrowthRate)}`}>
                      {analytics.users.newGrowthRate > 0 ? '+' : ''}{analytics.users.newGrowthRate.toFixed(1)}%
                    </span>
                    <span className="text-zinc-500 text-sm">vs last period</span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm">No data available</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(analytics?.users.active || 0)}</p>
              <div className="flex items-center gap-2 mt-2">
                {analytics?.users.activeGrowthRate ? (
                  <>
                    {getGrowthIcon(analytics.users.activeGrowthRate)}
                    <span className={`text-sm font-medium ${getGrowthColor(analytics.users.activeGrowthRate)}`}>
                      {analytics.users.activeGrowthRate > 0 ? '+' : ''}{analytics.users.activeGrowthRate.toFixed(1)}%
                    </span>
                    <span className="text-zinc-500 text-sm">vs last period</span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm">No data available</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Premium Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(analytics?.users.premium || 0)}</p>
              <div className="flex items-center gap-2 mt-2">
                {analytics?.users.premiumGrowthRate ? (
                  <>
                    {getGrowthIcon(analytics.users.premiumGrowthRate)}
                    <span className={`text-sm font-medium ${getGrowthColor(analytics.users.premiumGrowthRate)}`}>
                      {analytics.users.premiumGrowthRate > 0 ? '+' : ''}{analytics.users.premiumGrowthRate.toFixed(1)}%
                    </span>
                    <span className="text-zinc-500 text-sm">vs last period</span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm">No data available</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Messages</p>
              <p className="text-3xl font-bold text-white">{formatNumber(analytics?.content.messages || 0)}</p>
              <div className="flex items-center gap-2 mt-2">
                {analytics?.content.messagesGrowthRate ? (
                  <>
                    {getGrowthIcon(analytics.content.messagesGrowthRate)}
                    <span className={`text-sm font-medium ${getGrowthColor(analytics.content.messagesGrowthRate)}`}>
                      {analytics.content.messagesGrowthRate > 0 ? '+' : ''}{analytics.content.messagesGrowthRate.toFixed(1)}%
                    </span>
                    <span className="text-zinc-500 text-sm">vs last period</span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm">No data available</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Daily Activity</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-zinc-400">New Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-zinc-400">Messages</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics?.dailyStats.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-zinc-400 text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div 
                    className="bg-blue-500/20 border border-blue-500/30 rounded-lg h-8 flex items-center justify-center text-xs text-blue-400 font-medium"
                    style={{ width: `${Math.max(20, (day.newUsers / 100) * 100)}%` }}
                  >
                    {day.newUsers}
                  </div>
                  <div 
                    className="bg-green-500/20 border border-green-500/30 rounded-lg h-8 flex items-center justify-center text-xs text-green-400 font-medium"
                    style={{ width: `${Math.max(20, (day.messages / 1000) * 100)}%` }}
                  >
                    {day.messages}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">User Growth</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-700/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Total Users</p>
                  <p className="text-zinc-400 text-sm">All registered users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{formatNumber(analytics?.users.total || 0)}</p>
                <p className="text-green-400 text-sm">
                  {analytics?.users.totalGrowthRate ? `+${analytics.users.totalGrowthRate.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-700/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Premium Users</p>
                  <p className="text-zinc-400 text-sm">Paid subscriptions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{formatNumber(analytics?.users.premium || 0)}</p>
                <p className="text-green-400 text-sm">
                  {analytics?.users.premiumGrowthRate ? `+${analytics.users.premiumGrowthRate.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-700/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Active Today</p>
                  <p className="text-zinc-400 text-sm">Users active in last 24h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{formatNumber(analytics?.users.active || 0)}</p>
                <p className="text-green-400 text-sm">
                  {analytics?.users.activeGrowthRate ? `+${analytics.users.activeGrowthRate.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics?.revenue?.monthly ? `$${formatNumber(analytics.revenue.monthly)}` : "—"}
          </p>
          <p className="text-emerald-400 text-sm font-medium">
            {analytics?.revenue?.growthRate ? `+${analytics.revenue.growthRate.toFixed(1)}% this month` : "No data available"}
          </p>
          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-emerald-400 text-sm">Monthly recurring revenue</p>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Play className="w-6 h-6 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Total Streams</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics?.streams?.total ? formatNumber(analytics.streams.total) : "—"}
          </p>
          <p className="text-pink-400 text-sm font-medium">
            {analytics?.streams?.growthRate ? `+${analytics.streams.growthRate.toFixed(1)}% this month` : "No data available"}
          </p>
          <div className="mt-4 p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <p className="text-pink-400 text-sm">Music streaming activity</p>
          </div>
        </div>

        <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Avg Session</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics?.engagement?.avgSessionTime || "—"}
          </p>
          <p className="text-purple-400 text-sm font-medium">
            {analytics?.engagement?.sessionGrowthRate ? `+${analytics.engagement.sessionGrowthRate.toFixed(1)}% this month` : "No data available"}
          </p>
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-purple-400 text-sm">Average session duration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 