import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCustomAuth } from './AuthContext';
import toast from 'react-hot-toast';

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

interface UserStatus {
  userId: string;
  name: string;
  online: boolean;
  lastSeen?: Date;
}

interface TypingUser {
  userId: string;
  name: string;
  conversationId: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Map<string, UserStatus>;
  typingUsers: Map<string, TypingUser>;
  sendMessage: (receiverId: string, content: string, replyToId?: string) => void;
  markMessagesAsRead: (userId: string) => void;
  startTyping: (receiverId: string, conversationId: string) => void;
  stopTyping: (receiverId: string, conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useCustomAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserStatus>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  
  const typingTimeoutRef = useRef<Map<string, number>>(new Map());
  const reconnectTimeoutRef = useRef<number>();

  useEffect(() => {
    // Don't try to connect during loading or if not authenticated
    if (isLoading) {
      return;
    }

    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ No access token found in localStorage');
        return;
      }

      // Create socket connection
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';
      
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });



      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        setOnlineUsers(new Map());
        setTypingUsers(new Map());
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message || error);
        setIsConnected(false);
        
        // Only retry if it's not an authentication error
        if (!error.message?.includes('Authentication error')) {
          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, 3000);
        } else {
          console.error('Authentication failed, not retrying connection');
          toast.error('Authentication failed. Please login again.');
        }
      });

      // Message events
      newSocket.on('new_message', (message: Message) => {
        // Handle new message received
        toast.success(`New message from ${message.senderName}`);
        
        // Dispatch custom event for message components to listen
        window.dispatchEvent(new CustomEvent('new_message', { detail: message }));
      });

      newSocket.on('message_sent', (message: Message) => {
        // Handle message sent confirmation
        window.dispatchEvent(new CustomEvent('message_sent', { detail: message }));
      });

      newSocket.on('messages_read', (data: { readBy: string; conversationId: string }) => {
        // Handle messages read confirmation
        window.dispatchEvent(new CustomEvent('messages_read', { detail: data }));
      });

      newSocket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
        // Handle message deletion
        window.dispatchEvent(new CustomEvent('message_deleted', { detail: data }));
      });

      // User status events
      newSocket.on('user_online', (userStatus: UserStatus) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          updated.set(userStatus.userId, userStatus);
          return updated;
        });
      });

      newSocket.on('user_offline', (userStatus: UserStatus) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          updated.set(userStatus.userId, userStatus);
          return updated;
        });
      });

      newSocket.on('user_status_update', (data: { userId: string; status: string }) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          const user = updated.get(data.userId);
          if (user) {
            updated.set(data.userId, { ...user, online: data.status === 'online' });
          }
          return updated;
        });
      });

      // Typing events
      newSocket.on('user_typing', (typingUser: TypingUser) => {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          updated.set(typingUser.userId, typingUser);
          return updated;
        });

        // Clear typing after 3 seconds
        const timeoutId = setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(typingUser.userId);
            return updated;
          });
        }, 3000);

        typingTimeoutRef.current.set(typingUser.userId, timeoutId);
      });

      newSocket.on('user_stop_typing', (data: { userId: string; conversationId: string }) => {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          updated.delete(data.userId);
          return updated;
        });

        // Clear timeout
        const timeoutId = typingTimeoutRef.current.get(data.userId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          typingTimeoutRef.current.delete(data.userId);
        }
      });

      setSocket(newSocket);

      const onTokenRefreshed = (e: CustomEvent<{ accessToken?: string }>) => {
        const newToken = e.detail?.accessToken || localStorage.getItem('accessToken');
        if (!newToken) return;
        try {
          // Reconnect socket with new token
          newSocket.auth = { token: newToken } as any;
          newSocket.disconnect();
          newSocket.connect();
        } catch (err) {
          console.error('Failed to reconnect socket after token refresh:', err);
        }
      };

      window.addEventListener('tokenRefreshed', onTokenRefreshed as any);

      return () => {
        // Clear all timeouts
        typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
        typingTimeoutRef.current.clear();
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        window.removeEventListener('tokenRefreshed', onTokenRefreshed as any);
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Map());
        setTypingUsers(new Map());
      };
    } else {
      // Clean up any existing socket connection
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Map());
        setTypingUsers(new Map());
      }
    }
  }, [isAuthenticated, user, isLoading]);

  const sendMessage = (receiverId: string, content: string, replyToId?: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        receiverId,
        content,
        replyToId
      });
    }
  };

  const markMessagesAsRead = (userId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_messages_read', { userId });
    }
  };

  const startTyping = (receiverId: string, conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { receiverId, conversationId });
    }
  };

  const stopTyping = (receiverId: string, conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { receiverId, conversationId });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};