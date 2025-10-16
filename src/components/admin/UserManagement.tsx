import { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import {
  Users,
  Search,
  Filter,
  Edit,
  Crown,
  UserCheck,
  Mail,
  Calendar,
  Globe,
  Activity,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  UserX,
  UserPlus
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar: string | null;
  accountType: 'free' | 'premium' | 'family' | 'student';
  isEmailVerified: boolean;
  isAdmin: boolean;
  joinedAt: string;
  lastLogin: string;
  isActive: boolean; // recent activity indicator (last seen)
  isAccountActive?: boolean; // actual account status from DB (soft delete flag)
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'delete' | 'update' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from server...');
      const response = await (adminApi as any).getUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm
      });
      
      console.log('Fetched users response:', response);
      console.log('Users data:', response.users);
      
      // adminApi returns the response directly, so we access response.users
      setUsers(response.users || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalUsersCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setUpdating(true);
      setError(null);
      console.log('Updating user:', userId, updates);
      
      // Map the form data to the correct backend format
      const backendUpdates = {
        firstName: updates.firstName || '',
        lastName: updates.lastName || '',
        email: updates.email,
        accountType: updates.accountType,
        isAdmin: updates.isAdmin,
        isEmailVerified: updates.isEmailVerified,
        isActive: updates.isActive
      };
      
      console.log('Sending backend updates:', backendUpdates);
      console.log('User ID being updated:', userId);
      const result = await (adminApi as any).updateUser(userId, backendUpdates);
      console.log('Update result:', result);
      console.log('Update success:', result?.success);
      console.log('Updated user data from API:', result?.data?.user);
      console.log('Full API response:', JSON.stringify(result, null, 2));
      
      // Update the user in the local state immediately for better UX
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? {
                ...user,
                name: `${backendUpdates.firstName} ${backendUpdates.lastName}`.trim(),
                email: backendUpdates.email || user.email,
                accountType: backendUpdates.accountType || user.accountType,
                isAdmin: backendUpdates.isAdmin !== undefined ? backendUpdates.isAdmin : user.isAdmin,
                isEmailVerified: backendUpdates.isEmailVerified !== undefined ? backendUpdates.isEmailVerified : user.isEmailVerified,
                isActive: backendUpdates.isActive !== undefined ? backendUpdates.isActive : user.isActive
              }
            : user
        )
      );
      
      setSuccess('User updated successfully');
      setShowUserModal(false);
      
      // Also refresh from server to ensure data consistency
      console.log('Refreshing users from server...');
      await fetchUsers();
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(true);
      setError(null);
      console.log('Deleting user:', userId);
      const result = await (adminApi as any).deleteUser(userId);
      console.log('Delete result:', result);
      setSuccess('User deleted successfully');
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await (adminApi as any).bulkDeleteUsers(selectedUsers);
      setSuccess(`${selectedUsers.length} users deleted successfully`);
      await fetchUsers();
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkAction(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete users');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkUpdate = async (updates: any) => {
    try {
      setUpdating(true);
      setError(null);
      await (adminApi as any).bulkUpdateUsers(selectedUsers, updates);
      setSuccess(`${selectedUsers.length} users updated successfully`);
      await fetchUsers();
      setSelectedUsers([]);
      setShowBulkModal(false);
      setBulkAction(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update users');
    } finally {
      setUpdating(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      setUpdating(true);
      setError(null);
      await (adminApi as any).activateUser(userId);
      setSuccess('User activated successfully. Email notification sent.');
      await fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to activate user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      setUpdating(true);
      setError(null);
      await (adminApi as any).deactivateUser(userId);
      setSuccess('User deactivated successfully. Email notification sent.');
      await fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setUpdating(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            User Management
            <span className="ml-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Total: {totalUsersCount.toLocaleString()}
            </span>
            {selectedUsers.length > 0 && (
              <span className="ml-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Selected: {selectedUsers.length}
              </span>
            )}
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
          
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkAction('update');
                  setShowBulkModal(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Bulk Update
              </button>
              <button
                onClick={() => {
                  setBulkAction('delete');
                  setShowBulkModal(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Bulk Delete
              </button>
              <button
                onClick={clearSelection}
                className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors"
                title="Clear selection"
              >
                <XCircle className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          )}
          
          <button
            onClick={async () => {
              const headers = ['#','Name','Email','Account Type','Verified','Admin','Joined','Last Login','Active'];
              const csvRows = users.map((u, idx) => [
                String((currentPage - 1) * 20 + idx + 1),
                u.name || '',
                u.email || '',
                u.accountType || '',
                u.isEmailVerified ? 'Yes' : 'No',
                u.isAdmin ? 'Yes' : 'No',
                u.joinedAt ? new Date(u.joinedAt).toISOString() : '',
                u.lastLogin ? new Date(u.lastLogin).toISOString() : '',
                u.isActive ? 'Yes' : 'No'
              ]);
              const content = [headers.join(','), ...csvRows.map(r => r.map(f => `"${(f ?? '').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
              const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `users-report-page-${currentPage}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-200 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Generate Report
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
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={selectedUsers.length === users.length ? clearSelection : selectAllUsers}
                        className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">#</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">User</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Account Type</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Joined</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Last Seen</th>
                    <th className="px-6 py-4 text-left text-zinc-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/30">
                  {users.map((user, index) => {
                    // Calculate serial number based on current page and user index
                    const serialNumber = (currentPage - 1) * 20 + index + 1;
                    
                    return (
                    <tr key={`${user.id}-${index}`} className="hover:bg-zinc-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-400 font-mono text-sm">
                          {serialNumber}
                        </span>
                      </td>
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
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-zinc-500'}`}></div>
                            <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-zinc-400'}`}>
                              {user.isActive ? 'Recently Active' : 'Idle'}
                            </span>
                          </div>
                          {user.isAccountActive === false && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Deactivated
                            </span>
                          )}
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
                          {user.isAccountActive === false ? (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              disabled={updating}
                              className="p-2 hover:bg-green-700/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Activate user"
                            >
                              <UserPlus className="w-4 h-4 text-green-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              disabled={updating}
                              className="p-2 hover:bg-red-700/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Deactivate user"
                            >
                              <UserX className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
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


      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSubmit={(updates) => handleUpdateUser(selectedUser.id, updates)}
          loading={updating}
        />
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          loading={deleting}
        />
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <BulkActionsModal
          action={bulkAction}
          selectedCount={selectedUsers.length}
          onClose={() => {
            setShowBulkModal(false);
            setBulkAction(null);
          }}
          onConfirm={bulkAction === 'delete' ? handleBulkDelete : handleBulkUpdate}
          loading={deleting || updating}
        />
      )}
    </div>
  );
};


// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSubmit, loading }: {
  user: User;
  onClose: () => void;
  onSubmit: (updates: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email,
    accountType: user.accountType,
    isAdmin: user.isAdmin,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive
  });

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      accountType: user.accountType,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    onSubmit(formData);
  };

  return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Edit className="w-5 h-5 text-blue-400" />
          Edit User
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Account Type
                </label>
                <select
              value={formData.accountType}
              onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                  className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="family">Family</option>
                  <option value="student">Student</option>
                </select>
              </div>

          <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-zinc-300 text-sm">Admin Access</span>
                </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isEmailVerified}
                onChange={(e) => setFormData(prev => ({ ...prev, isEmailVerified: e.target.checked }))}
                className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-zinc-300 text-sm">Email Verified</span>
            </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-zinc-300 text-sm">Active Account</span>
                </label>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
              type="button"
              onClick={onClose}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete User Modal Component
const DeleteUserModal = ({ user, onClose, onConfirm, loading }: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Delete User</h3>
            <p className="text-zinc-400 text-sm">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-zinc-700/30 rounded-xl p-4 mb-6">
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
              <p className="text-zinc-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <p className="text-zinc-300 text-sm mb-6">
          Are you sure you want to delete this user? All their data, playlists, and activity will be permanently removed.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
  );
};

// Bulk Actions Modal Component
const BulkActionsModal = ({ action, selectedCount, onClose, onConfirm, loading }: {
  action: 'delete' | 'update' | null;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (data?: any) => void;
  loading: boolean;
}) => {
  const [updateData, setUpdateData] = useState({
    accountType: 'free' as 'free' | 'premium' | 'family' | 'student',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'update') {
      onConfirm(updateData);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            action === 'delete' ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            {action === 'delete' ? (
              <Trash2 className="w-6 h-6 text-red-400" />
            ) : (
              <Edit className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {action === 'delete' ? 'Bulk Delete Users' : 'Bulk Update Users'}
            </h3>
            <p className="text-zinc-400 text-sm">
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
        
        {action === 'delete' ? (
          <>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Warning</span>
              </div>
              <p className="text-red-300 text-sm">
                This will permanently delete {selectedCount} user{selectedCount !== 1 ? 's' : ''} and all their data. This action cannot be undone.
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-2">
                Account Type
              </label>
              <select
                value={updateData.accountType}
                onChange={(e) => setUpdateData(prev => ({ ...prev, accountType: e.target.value as any }))}
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="family">Family</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateData.isActive}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-zinc-300 text-sm">Active Account</span>
              </label>
            </div>
          </form>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={action === 'update' ? handleSubmit : onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              action === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading 
              ? (action === 'delete' ? 'Deleting...' : 'Updating...')
              : (action === 'delete' ? 'Delete Users' : 'Update Users')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 