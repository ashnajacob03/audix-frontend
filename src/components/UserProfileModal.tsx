import React, { useState, useEffect } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  MessageCircle, 
  User, 
  Users, 
  Search,
  UserPlus,
  Clock
} from 'lucide-react';

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

interface Friend {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  mutualFriends?: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useCustomAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'following'>('friends');

  useEffect(() => {
    if (isOpen && user) {
      fetchFriends();
    }
  }, [isOpen, user]);

  const fetchFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/user/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setFriends(data.data.friends || []);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageFriend = (friendId: string) => {
    navigate(`/messages?friendId=${friendId}`);
    onClose();
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center overflow-hidden relative">
                {user?.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user?.fullName || 'User'}
                    className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                    loading="lazy"
                  />
                )}
                {/* Fallback - always present but only visible when image fails or doesn't exist */}
                <div className={`absolute inset-0 flex items-center justify-center ${user?.profilePicture ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`}>
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName || 'User'} {user?.lastName || ''}
              </h2>
              <p className="text-zinc-400">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {friends.length} friends
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Friends ({friends.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Following
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-96">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading friends...</div>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-64">
                  {searchQuery 
                    ? 'Try searching with a different name or email.' 
                    : 'Start connecting with people to see them here.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center overflow-hidden relative">
                        {friend.avatar && (
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
                            onError={(e) => {
                              e.currentTarget.style.opacity = '0';
                            }}
                            loading="lazy"
                          />
                        )}
                        {/* Fallback - always present but only visible when image fails or doesn't exist */}
                        <div className={`absolute inset-0 flex items-center justify-center ${friend.avatar ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      {friend.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{friend.name}</h3>
                      <p className="text-sm text-zinc-400 truncate">{friend.email}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        {friend.online ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Online</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Last seen {new Date(friend.lastSeen).toLocaleDateString()}</span>
                          </>
                        )}
                        {friend.mutualFriends && (
                          <>
                            <span>•</span>
                            <span>{friend.mutualFriends} mutual friends</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMessageFriend(friend.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="Send message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 bg-zinc-900/50">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Click on a friend to start messaging</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;