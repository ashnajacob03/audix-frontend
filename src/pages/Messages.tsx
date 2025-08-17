import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import AudixTopbar from '@/components/AudixTopbar';
import UserAvatar from '@/components/UserAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  User,
  Clock,
  Loader2,
  Trash2
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
  isOptimistic?: boolean; // Flag for optimistic updates
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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete message function
  const handleDeleteMessage = async (messageId: string) => {
    try {
      console.log('🗑️ Attempting to delete message:', messageId);
      console.log('👤 Current user ID:', user?.id);
      
      // Find the message in local state to get sender info
      const messageToDelete = messages.find(msg => msg.id === messageId);
      if (messageToDelete) {
        console.log('📝 Message sender ID:', messageToDelete.senderId);
        console.log('🔍 User ID vs Sender ID match:', user?.id === messageToDelete.senderId);
      }
      
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('❌ No access token found');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Delete response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message deleted successfully:', data);
        // Remove message from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete message:', errorData);
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
    }
  };

  // Deduplicate conversations by participant (keep the most recent)
  const dedupeConversationsByParticipant = (items: Conversation[]): Conversation[] => {
    const map = new Map<string, Conversation>();
    for (const conv of items) {
      const key = conv.participant.id;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, conv);
        continue;
      }
      const existingTime = new Date(existing.lastMessageAt || existing.updatedAt).getTime();
      const currentTime = new Date(conv.lastMessageAt || conv.updatedAt).getTime();
      if (currentTime > existingTime) map.set(key, conv);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime()
    );
  };

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
        console.log('🔍 Frontend received conversations data:', data);
        if (data.success) {
          const deduped = dedupeConversationsByParticipant(data.data.conversations || []);
          console.log('🔍 Deduped conversations:', deduped);
          setConversations(deduped);
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
        setMessages(prev => {
          // Check if message already exists (to avoid duplicates)
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();
      }
      
      // Update conversations list
      setConversations(prev => {
        const updated = [...prev];
        const currentUserId = user?.id || '';
        const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
        const convIndex = updated.findIndex(conv => conv.participant.id === otherUserId);
        
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
        } else {
          // Create minimal conversation if none exists yet
          const friend = friends.find(f => f.id === otherUserId);
          const displayName = friend?.name || message.senderName || 'User';
          updated.unshift({
            id: message.conversationId,
            conversationId: message.conversationId,
            participant: {
              id: otherUserId,
              name: displayName,
              firstName: friend?.firstName || displayName.split(' ')[0] || '',
              lastName: friend?.lastName || displayName.split(' ').slice(1).join(' ') || '',
              avatar: friend?.avatar || '',
              online: !!friend?.online,
              lastSeen: friend?.lastSeen || ''
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              sender: message.senderName,
              senderId: message.senderId,
              timestamp: message.timestamp,
              isRead: message.isRead
            },
            unreadCount: 0,
            lastMessageAt: message.timestamp,
            updatedAt: message.timestamp
          });
        }

        return dedupeConversationsByParticipant(updated);
      });
    };

    const handleMessageSent = (message: Message) => {
      if (message.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => {
          // Check if we have an optimistic message that should be replaced
          const optimisticIndex = prev.findIndex(msg => 
            msg.isOptimistic && 
            msg.content === message.content && 
            msg.senderId === message.senderId
          );
          
          if (optimisticIndex !== -1) {
            // Replace optimistic message with real message
            const updated = [...prev];
            updated[optimisticIndex] = { ...message, isOptimistic: false };
            return updated;
          } else {
            // Add new message if no optimistic message found
            return [...prev, message];
          }
        });
        scrollToBottom();
      }

      // Update conversations list for the sender as well
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(conv => conv.participant.id === message.receiverId);

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
        } else {
          const friend = friends.find(f => f.id === message.receiverId);
          const displayName = friend?.name || message.receiverName || 'User';
          updated.unshift({
            id: message.conversationId,
            conversationId: message.conversationId,
            participant: {
              id: friend?.id || message.receiverId,
              name: displayName,
              firstName: friend?.firstName || displayName.split(' ')[0] || '',
              lastName: friend?.lastName || displayName.split(' ').slice(1).join(' ') || '',
              avatar: friend?.avatar || '',
              online: !!friend?.online,
              lastSeen: friend?.lastSeen || ''
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              sender: message.senderName,
              senderId: message.senderId,
              timestamp: message.timestamp,
              isRead: message.isRead
            },
            unreadCount: 0,
            lastMessageAt: message.timestamp,
            updatedAt: message.timestamp
          });
        }
        return dedupeConversationsByParticipant(updated);
      });
    };

    const handleMessagesRead = (data: { readBy: string; conversationId: string }) => {
      if (data.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => prev.map(msg => 
          msg.senderId === user?.id ? { ...msg, isRead: true } : msg
        ));
      }
      
      // Update conversations to reset unread count for the conversation that was read
      setConversations(prev => prev.map(conv => 
        conv.conversationId === data.conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId === getConversationId(user?.id || '', selectedChat || '')) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      }
    };

    const newMessageListener = (e: any) => handleNewMessage(e.detail);
    const messageSentListener = (e: any) => handleMessageSent(e.detail);
    const messagesReadListener = (e: any) => handleMessagesRead(e.detail);
    const messageDeletedListener = (e: any) => handleMessageDeleted(e.detail);

    window.addEventListener('new_message', newMessageListener);
    window.addEventListener('message_sent', messageSentListener);
    window.addEventListener('messages_read', messagesReadListener);
    window.addEventListener('message_deleted', messageDeletedListener);

    return () => {
      window.removeEventListener('new_message', newMessageListener);
      window.removeEventListener('message_sent', messageSentListener);
      window.removeEventListener('messages_read', messagesReadListener);
      window.removeEventListener('message_deleted', messageDeletedListener);
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
      
      // Update local conversations state to reflect unread count reset
      setConversations(prev => prev.map(conv => 
        conv.participant.id === userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageContent = newMessage.trim();
    const tempMessageId = `temp_${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempMessageId,
      content: messageContent,
      senderId: user?.id || '',
      senderName: user?.firstName + ' ' + user?.lastName || '',
      receiverId: selectedChat,
      receiverName: selectedFriend?.name || '',
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: 'text',
      conversationId: getConversationId(user?.id || '', selectedChat),
      isOptimistic: true // Flag to identify optimistic messages
    };
    
    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    stopTyping();
    scrollToBottom();
    
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
          content: messageContent,
          messageType: 'text'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const realMessage = data.data;
        
        // Replace optimistic message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId ? { ...realMessage, isOptimistic: false } : msg
        ));
      } else {
        // Remove optimistic message if failed
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        setNewMessage(messageContent); // Restore the message content
        console.error('Failed to send message');
      }
    } catch (error) {
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setNewMessage(messageContent); // Restore the message content
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
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
      typingTimeoutRef.current = null;
    }, 800);
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
  // Prioritize conversations with messages, then friends without conversations
  const sidebarUsers = [
    // First, add ALL conversations (sorted by last message time)
    ...conversations
      .filter(conv => conv.participant.id !== user?.id) // Exclude current user
      .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime())
      .map(conv => {
        console.log('🔍 Processing conversation for sidebar:', {
          id: conv.id,
          participant: conv.participant.name,
          lastMessage: conv.lastMessage,
          hasConversation: true
        });
        return {
          id: conv.participant.id,
          name: conv.participant.name,
          firstName: conv.participant.firstName,
          lastName: conv.participant.lastName,
          avatar: conv.participant.avatar,
          online: conv.participant.online,
          lastSeen: conv.participant.lastSeen,
          conversation: conv,
          unreadCount: conv.unreadCount,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          hasConversation: true
        };
      }),
    // Then add friends without conversations (exclude current user)
    ...friends
      .filter(friend => friend.id !== user?.id && !conversations.some(conv => conv.participant.id === friend.id))
      .map(friend => {
        console.log('🔍 Processing friend for sidebar:', {
          id: friend.id,
          name: friend.name,
          hasConversation: false
        });
        return {
          ...friend,
          conversation: null,
          unreadCount: 0,
          lastMessage: null,
          lastMessageAt: null,
          hasConversation: false
        };
      })
  ];

  console.log('🔍 Final sidebarUsers array:', sidebarUsers);

  // Filter by search (memoized)
  const filteredSidebarUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sidebarUsers.filter(u => u.name.toLowerCase().includes(q));
  }, [sidebarUsers, searchQuery]);

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
                  {conversations.filter(conv => conv.lastMessage).length} conversation{conversations.filter(conv => conv.lastMessage).length !== 1 ? 's' : ''} • {friends.length} friend{friends.length !== 1 ? 's' : ''} available
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
                filteredSidebarUsers.map((sidebarUser) => {
                  const isOnline = onlineUsers.has(sidebarUser.id) && 
                    onlineUsers.get(sidebarUser.id)?.online;
                  
                  return (
                    <div
                      key={sidebarUser.id}
                      onClick={() => {
                        setSelectedChat(sidebarUser.id);
                        navigate(`/messages?friendId=${sidebarUser.id}`);
                        
                        // Immediately reset unread count in UI for better UX
                        if (sidebarUser.unreadCount > 0) {
                          setConversations(prev => prev.map(conv => 
                            conv.participant.id === sidebarUser.id 
                              ? { ...conv, unreadCount: 0 }
                              : conv
                          ));
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedChat === sidebarUser.id
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={sidebarUser.avatar}
                          firstName={sidebarUser.firstName}
                          lastName={sidebarUser.lastName}
                          size="md"
                          showOnlineStatus={isOnline}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">{sidebarUser.name}</h3>
                            <span className="text-xs text-zinc-400">
                              {sidebarUser.lastMessageAt ? 
                                new Date(sidebarUser.lastMessageAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : ''
                              }
                            </span>
                          </div>
                          
                          <p className="text-sm text-zinc-400 truncate">
                            {(() => {
                              console.log('🔍 Rendering message preview for:', sidebarUser.name, {
                                lastMessage: sidebarUser.lastMessage,
                                hasConversation: sidebarUser.hasConversation,
                                conversation: sidebarUser.conversation
                              });
                              
                              if (sidebarUser.lastMessage) {
                                const preview = `${sidebarUser.lastMessage.senderId?.toString() === user?.id ? 'You: ' : ''}${sidebarUser.lastMessage.content}`;
                                console.log('🔍 Message preview:', preview);
                                return preview;
                              } else if (sidebarUser.hasConversation) {
                                console.log('🔍 Has conversation but no last message');
                                return 'Start a conversation';
                              } else {
                                console.log('🔍 No conversation');
                                return 'No messages yet';
                              }
                            })()}
                          </p>
                          
                          {isOnline && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-400">Online</span>
                            </div>
                          )}
                        </div>
                        
                        {sidebarUser.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{sidebarUser.unreadCount}</span>
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
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div className="max-w-xs lg:max-w-md relative">
                            {message.replyTo && (
                              <div className="mb-1 px-3 py-1 bg-zinc-800/50 rounded-t-lg border-l-2 border-zinc-600">
                                <p className="text-xs text-zinc-400">Replying to {message.replyTo.senderName}</p>
                                <p className="text-xs text-zinc-300 truncate">{message.replyTo.content}</p>
                              </div>
                            )}
                            <div
                              className={`px-4 py-2 ${message.replyTo ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl'} ${
                                message.senderId === user?.id
                                  ? message.isOptimistic 
                                    ? 'bg-green-400 text-white opacity-75' 
                                    : 'bg-green-500 text-white'
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
                                <div className="flex items-center gap-1">
                                  {message.senderId === user?.id && (
                                    <span className="ml-2">
                                      {message.isOptimistic ? (
                                        <Loader2 className="w-3 h-3 animate-spin text-yellow-300" />
                                      ) : (
                                        <span>{message.isRead ? '✓✓' : '✓'}</span>
                                      )}
                                    </span>
                                  )}
                                  {/* 3-dot menu for message options */}
                                  {message.senderId === user?.id && !message.isOptimistic && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/20 rounded">
                                          <MoreVertical className="w-3 h-3" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="text-red-500 focus:text-red-500 cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
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
