import React, { useState, useEffect } from 'react';
import { Bell, Check, X, User, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';

interface Notification {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  } | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionTaken: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  userId: string;
  authToken: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, authToken }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (senderId: string, notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/friend-request/${senderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the notification to show it's been accepted
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId 
              ? { ...notif, actionTaken: 'accepted', isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Decline friend request
  const declineFriendRequest = async (senderId: string, notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/friend-request/${senderId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the notification to show it's been declined
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId 
              ? { ...notif, actionTaken: 'declined', isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Accept follow request
  const acceptFollowRequest = async (senderId: string, notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/follow/${senderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the notification to show it's been accepted
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId 
              ? { ...notif, actionTaken: 'accepted', isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  // Decline follow request
  const declineFollowRequest = async (senderId: string, notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/follow/${senderId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the notification to show it's been declined
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId 
              ? { ...notif, actionTaken: 'declined', isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error declining follow request:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on component mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "relative flex items-center justify-center text-zinc-300 hover:text-white transition-colors bg-transparent hover:bg-transparent border-0 p-0 cursor-pointer"
                )}
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-700 p-0">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <ScrollArea className="h-96">
              {loading ? (
                <div className="p-4 text-center text-zinc-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-zinc-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="py-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "p-3 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors",
                        !notification.isRead && "bg-zinc-800/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.sender?.profilePicture ? (
                            <img
                              src={notification.sender.profilePicture}
                              alt={`${notification.sender?.firstName || 'User'} ${notification.sender?.lastName || ''}`}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-zinc-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate">
                              {notification.sender ? `${notification.sender.firstName} ${notification.sender.lastName}` : 'Unknown User'}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-zinc-300 mt-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="text-xs text-zinc-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>

                          {/* Friend request actions */}
                          {notification.type === 'friend_request' && notification.actionTaken === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => notification.sender && acceptFriendRequest(notification.sender._id, notification._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                                disabled={!notification.sender}
                              >
                                <Check className="w-3 h-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => notification.sender && declineFriendRequest(notification.sender._id, notification._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                                disabled={!notification.sender}
                              >
                                <X className="w-3 h-3" />
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Follow request actions */}
                          {notification.type === 'follow_request' && notification.actionTaken === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => notification.sender && acceptFollowRequest(notification.sender._id, notification._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                                disabled={!notification.sender}
                              >
                                <Check className="w-3 h-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => notification.sender && declineFollowRequest(notification.sender._id, notification._id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                                disabled={!notification.sender}
                              >
                                <X className="w-3 h-3" />
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Show status for processed friend requests */}
                          {notification.type === 'friend_request' && notification.actionTaken !== 'pending' && (
                            <div className="mt-2">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                notification.actionTaken === 'accepted' 
                                  ? "bg-green-900/50 text-green-300" 
                                  : "bg-red-900/50 text-red-300"
                              )}>
                                {notification.actionTaken === 'accepted' ? 'Accepted' : 'Declined'}
                              </span>
                            </div>
                          )}

                          {/* Show status for processed follow requests */}
                          {notification.type === 'follow_request' && notification.actionTaken !== 'pending' && (
                            <div className="mt-2">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                notification.actionTaken === 'accepted' 
                                  ? "bg-green-900/50 text-green-300" 
                                  : "bg-red-900/50 text-red-300"
                              )}>
                                {notification.actionTaken === 'accepted' ? 'Accepted' : 'Declined'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <TooltipContent>
          <p>Notifications {unreadCount > 0 && `(${unreadCount})`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationDropdown;