import React, { useState, useEffect } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile,
  Paperclip,
  User,
  Music,
  Clock
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

const Messages = () => {
  const { user } = useCustomAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
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
    };
    fetchFriends();
  }, [user]);

  // Messages for selected chat (empty - ready for backend integration)
  const messages: any[] = [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFriend = friends.find(friend => friend.id === selectedChat);

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      
      <div className="flex h-[calc(100vh-180px)]">
        {/* Friends List Sidebar */}
        <div className="w-80 bg-zinc-900/50 border-r border-zinc-700">
          {/* Header */}
          <div className="p-4 border-b border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h2>
            </div>
            
            {/* Search */}
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

          {/* Friends List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No friends yet</h3>
                  <p className="text-sm text-zinc-400 max-w-48">
                    {searchQuery ? 'No friends match your search.' : 'Start connecting with friends to begin messaging.'}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedChat(friend.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedChat === friend.id
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {friend.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{friend.name}</h3>
                        <span className="text-xs text-zinc-400">{friend.timestamp}</span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 truncate">{friend.lastMessage}</p>
                      
                      {friend.currentSong && (
                        <div className="flex items-center gap-1 mt-1">
                          <Music className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-400 truncate">{friend.currentSong}</span>
                        </div>
                      )}
                    </div>
                    
                    {friend.unread > 0 && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{friend.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-700 bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedFriend.avatar}
                        alt={selectedFriend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedFriend.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{selectedFriend.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        {selectedFriend.online ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Online</span>
                            {selectedFriend.currentSong && (
                              <>
                                <span>•</span>
                                <Music className="w-3 h-3" />
                                <span className="truncate max-w-40">{selectedFriend.currentSong}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Last seen {selectedFriend.timestamp}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <MessageCircle className="w-16 h-16 text-zinc-600 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">No messages yet</h3>
                      <p className="text-zinc-400">
                        Start a conversation with {selectedFriend?.name || 'your friend'}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === 'me'
                            ? 'bg-green-500 text-white'
                            : 'bg-zinc-700 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'me' ? 'text-green-100' : 'text-zinc-400'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-700 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-zinc-400">Choose a friend to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Messages;
