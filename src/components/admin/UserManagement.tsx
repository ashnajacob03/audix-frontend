import { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Crown,
  UserCheck,
  Mail,
  Calendar,
  Globe,
  Activity,
  Shield
} from 'lucide-react';

interface User {
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
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm
      });
      
      // adminApi returns response.data from the API, so response already has { users, pagination }
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setTotalUsersCount(response.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update handler can be wired to the modal when enabling edits

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'family':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'student':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'premium':
        return <Crown className="w-4 h-4" />;
      case 'family':
        return <Users className="w-4 h-4" />;
      case 'student':
        return <Activity className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            User Management
            <span className="ml-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Total: {totalUsersCount.toLocaleString()}
            </span>
          </h2>
          <p className="text-zinc-400 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors">
            <Filter className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-zinc-400 mt-2">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">User</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Account Type</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Joined</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Last Seen</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/30">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-zinc-500" />
                              <span className="text-zinc-400">{user.email}</span>
                              {user.isEmailVerified && (
                                <span className="text-green-400 text-xs">✓ Verified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccountTypeColor(user.accountType)}`}>
                            {getAccountTypeIcon(user.accountType)}
                          </span>
                          <span className="text-zinc-300 capitalize">{user.accountType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className={`text-sm font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {user.isAdmin && (
                            <Shield className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(user.joinedAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">{formatLastSeen(user.lastLogin)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-zinc-700/30">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm">
                    Showing page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-zinc-700/50 hover:bg-zinc-700/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-zinc-700/50 hover:bg-zinc-700/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Account Type
                </label>
                <select
                  defaultValue={selectedUser.accountType}
                  className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="family">Family</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={selectedUser.isAdmin}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-zinc-300 text-sm">Admin Access</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={selectedUser.isActive}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-zinc-300 text-sm">Active Account</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 