import React, { useState, useEffect, useRef } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import AudixTopbar from '@/components/AudixTopbar';
import UserAvatar from '@/components/UserAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation, useNavigate } from 'react-router-dom';
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

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  timestamp: string;
  isRead: boolean;
  messageType: string;
  conversationId: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
    timestamp: string;
  };
}

interface Conversation {
  id: string;
  conversationId: string;
  participant: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
    online: boolean;
    lastSeen: string;
  };
  lastMessage: {
    id: string;
    content: string;
    sender: string;
    senderId: string;
    timestamp: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
  updatedAt: string;
}

interface FollowedUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: string;
}

const Messages = () => {
  const { user } = useCustomAuth();
  const { socket, isConnected, onlineUsers, typingUsers } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friends, setFriends] = useState<FollowedUser[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        if (data.success) {
          setConversations(data.data.conversations || []);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchConversations();
  }, [user]);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const friendId = params.get('friendId');
    if (friendId) {
      setSelectedChat(friendId);
    }
  }, [location.search]);

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !user) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/messages/conversations/${selectedChat}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.messages || []);
          // Mark messages as read
          await markMessagesAsRead(selectedChat);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      
      // Update conversations list
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(conv => 
          conv.participant.id === message.senderId || conv.participant.id === message.receiverId
        );
        
        if (convIndex !== -1) {
          updated[convIndex].lastMessage = {
            id: message.id,
            content: message.content,
            sender: message.senderName,
            senderId: message.senderId,
            timestamp: message.timestamp,
            isRead: message.isRead
          };
          updated[convIndex].lastMessageAt = message.timestamp;
          
          // Move to top
          const conv = updated.splice(convIndex, 1)[0];
          updated.unshift(conv);
        }
        
        return updated;
      });
    };

    const handleMessageSent = (message: Message) => {
      if (message.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleMessagesRead = (data: { readBy: string; conversationId: string }) => {
      if (data.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => prev.map(msg => 
          msg.senderId === user?.id ? { ...msg, isRead: true } : msg
        ));
      }
    };

    window.addEventListener('new_message', (e: any) => handleNewMessage(e.detail));
    window.addEventListener('message_sent', (e: any) => handleMessageSent(e.detail));
    window.addEventListener('messages_read', (e: any) => handleMessagesRead(e.detail));

    return () => {
      window.removeEventListener('new_message', (e: any) => handleNewMessage(e.detail));
      window.removeEventListener('message_sent', (e: any) => handleMessageSent(e.detail));
      window.removeEventListener('messages_read', (e: any) => handleMessagesRead(e.detail));
    };
  }, [socket, selectedChat, user]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper function to get conversation ID
  const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
  };

  // Mark messages as read
  const markMessagesAsRead = async (userId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/messages/mark-read/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedChat,
          content: newMessage.trim(),
          messageType: 'text'
        }),
      });
      
      if (response.ok) {
        setNewMessage('');
        stopTyping();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Typing indicators
  const startTyping = () => {
    if (!selectedChat || isTyping) return;
    
    setIsTyping(true);
    socket?.emit('typing_start', {
      receiverId: selectedChat,
      conversationId: getConversationId(user?.id || '', selectedChat)
    });
  };

  const stopTyping = () => {
    if (!selectedChat || !isTyping) return;
    
    setIsTyping(false);
    socket?.emit('typing_stop', {
      receiverId: selectedChat,
      conversationId: getConversationId(user?.id || '', selectedChat)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      startTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  // Fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
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
          const friendsList = data.data.friends.map((friend: any) => ({
            id: friend.id,
            name: friend.name,
            firstName: friend.firstName,
            lastName: friend.lastName,
            avatar: friend.avatar,
            authMethod: friend.authMethod,
            isGoogleUser: friend.isGoogleUser,
            online: friend.online,
            lastSeen: friend.lastSeen,
          }));
          setFriends(friendsList);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };
    fetchFriends();
  }, [user]);

  // Merge conversations and friends for sidebar
  const sidebarUsers = friends.map(friend => {
    const conv = conversations.find(c => c.participant.id === friend.id);
    return {
      ...friend,
      conversation: conv || null,
      unreadCount: conv?.unreadCount || 0,
      lastMessage: conv?.lastMessage || null,
      lastMessageAt: conv?.lastMessageAt || null,
    };
  });

  // Filter by search
  const filteredSidebarUsers = sidebarUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.participant.id === selectedChat);
  const selectedFriend = selectedConversation?.participant || friends.find(u => u.id === selectedChat) || null;

  // Check if user is typing
  const isUserTyping = selectedChat && typingUsers.has(selectedChat);
  const typingUser = isUserTyping ? typingUsers.get(selectedChat) : null;

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Disconnected - Trying to reconnect...</span>
          </div>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-180px)]">
        {/* Friends List Sidebar */}
        <div className="w-80 bg-zinc-900/50 border-r border-zinc-700">
          {/* Header */}
          <div className="p-4 border-b border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {friends.length} friend{friends.length !== 1 ? 's' : ''} available
                </p>
              </div>
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

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredSidebarUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-48">
                    {searchQuery
                      ? 'No friends match your search.'
                      : 'Add friends to start messaging. Visit the Discover page to find and connect with other users.'
                    }
                  </p>
                </div>
              ) : (
                filteredSidebarUsers.map((user) => {
                  const isOnline = onlineUsers.has(user.id) && 
                    onlineUsers.get(user.id)?.online;
                  
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedChat(user.id);
                        navigate(`/messages?friendId=${user.id}`);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat === user.id
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.avatar}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="md"
                          showOnlineStatus={isOnline}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">{user.name}</h3>
                            <span className="text-xs text-zinc-400">
                              {user.lastMessageAt ? 
                                new Date(user.lastMessageAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : ''
                              }
                            </span>
                          </div>
                          
                          <p className="text-sm text-zinc-400 truncate">
                            {user.lastMessage ? 
                              `${user.lastMessage.senderId === user?.id ? 'You: ' : ''}${user.lastMessage.content}` 
                              : 'No messages yet'
                            }
                          </p>
                          
                          {isOnline && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-400">Online</span>
                            </div>
                          )}
                        </div>
                        
                        {user.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{user.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
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
                    <UserAvatar
                      src={selectedFriend?.avatar}
                      firstName={selectedFriend?.firstName}
                      lastName={selectedFriend?.lastName}
                      size="md"
                      showOnlineStatus={onlineUsers.has(selectedFriend?.id) && onlineUsers.get(selectedFriend?.id)?.online}
                    />
                    <div>
                      <h3 className="font-medium text-white">{selectedFriend.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        {(onlineUsers.has(selectedFriend.id) && onlineUsers.get(selectedFriend.id)?.online) ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Online</span>
                            {isUserTyping && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">typing...</span>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Last seen {selectedFriend.lastSeen ? 
                              new Date(selectedFriend.lastSeen).toLocaleString() : 'Unknown'
                            }</span>
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-white">Loading messages...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <MessageCircle className="w-16 h-16 text-zinc-600 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">No messages yet</h3>
                      <p className="text-zinc-400">
                        Start a conversation with {selectedFriend?.name || 'your friend'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-xs lg:max-w-md">
                            {message.replyTo && (
                              <div className="mb-1 px-3 py-1 bg-zinc-800/50 rounded-t-lg border-l-2 border-zinc-600">
                                <p className="text-xs text-zinc-400">Replying to {message.replyTo.senderName}</p>
                                <p className="text-xs text-zinc-300 truncate">{message.replyTo.content}</p>
                              </div>
                            )}
                            <div
                              className={`px-4 py-2 ${message.replyTo ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl'} ${
                                message.senderId === user?.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-zinc-700 text-white'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                message.senderId === user?.id ? 'text-green-100' : 'text-zinc-400'
                              }`}>
                                <span>
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {message.senderId === user?.id && (
                                  <span className="ml-2">
                                    {message.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicator */}
                      {isUserTyping && typingUser && (
                        <div className="flex justify-start">
                          <div className="max-w-xs lg:max-w-md px-4 py-2 bg-zinc-700 text-white rounded-2xl">
                            <div className="flex items-center gap-1">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-zinc-400 ml-2">{typingUser.name} is typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
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
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={!isConnected}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
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
