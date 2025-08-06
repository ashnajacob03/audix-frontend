import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomAuth } from "@/contexts/AuthContext";
import { Users, Music, UserPlus, UserCheck, Clock, Crown, UserX, Send, Clock as ClockIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  picture?: string;
  accountType: string;
  joinedAt: string;
  lastSeen?: string;
  isOnline: boolean;
  isFollowing: boolean;
  followersCount: number;
  friendStatus: 'none' | 'friends' | 'request_sent' | 'request_received';
}

const FriendsActivity = () => {
	const { isAuthenticated, user: currentUser } = useCustomAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
	const [requestSentUsers, setRequestSentUsers] = useState<Set<string>>(new Set());
	const [requestReceivedUsers, setRequestReceivedUsers] = useState<Set<string>>(new Set());
	const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

	const ADMIN_EMAIL = 'ashnajacob003@gmail.com'; // Change to your actual admin email

	// Fetch all users
	const fetchUsers = async () => {
		if (!isAuthenticated) return;

		setIsLoading(true);
		try {
			const token = localStorage.getItem('accessToken');
			const response = await fetch(`${API_BASE_URL}/user/all`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				setUsers(data.data.users);
				// Initialize following and request states
				const following = new Set();
				const sentRequests = new Set();
				const receivedRequests = new Set();

				data.data.users.forEach((user: User) => {
					if (user.isFollowing) {
						following.add(user.id);
					}
					if (user.friendStatus === 'request_sent') {
						sentRequests.add(user.id);
					}
					if (user.friendStatus === 'request_received') {
						receivedRequests.add(user.id);
					}
				});

				setFollowingUsers(following);
				setRequestSentUsers(sentRequests);
				setRequestReceivedUsers(receivedRequests);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Failed to load users');
		} finally {
			setIsLoading(false);
		}
	};

	// Debug user relationship
	const debugUserRelationship = async (userId: string) => {
		try {
			const token = localStorage.getItem('accessToken');
			const response = await fetch(`${API_BASE_URL}/user/debug/${userId}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			console.log('User relationship debug:', data);
			return data;
		} catch (error) {
			console.error('Debug failed:', error);
		}
	};

	// Fix relationships (temporary)
	const fixRelationships = async () => {
		try {
			const token = localStorage.getItem('accessToken');
			const response = await fetch(`${API_BASE_URL}/user/fix-relationships`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			console.log('Fix relationships result:', data);
			if (data.success) {
				toast.success(`Fixed ${data.data.fixed} relationships`);
				fetchUsers(); // Refresh the user list
			}
		} catch (error) {
			console.error('Fix relationships failed:', error);
			toast.error('Failed to fix relationships');
		}
	};

	// Send follow request
	const handleFollowRequest = async (userId: string) => {
		console.log('Attempting to follow user:', userId);
		
		// Debug the relationship first
		await debugUserRelationship(userId);
		
		if (processingRequests.has(userId)) return;

		try {
			setProcessingRequests(prev => new Set(prev).add(userId));
			const token = localStorage.getItem('accessToken');
			console.log('Token available:', !!token);

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			console.log('Follow request response:', { 
				status: response.status, 
				data, 
				userId,
				message: data.message,
				success: data.success 
			});
			if (data.success) {
				setRequestSentUsers(prev => new Set(prev).add(userId));
				toast.success('Follow request sent');
				fetchUsers(); // <-- refetch
			} else {
				console.error('Follow request failed:', {
					status: response.status,
					message: data.message,
					fullResponse: data
				});
				toast.error(data.message || 'Failed to send follow request');
			}
		} catch (error) {
			console.error('Error sending follow request:', error);
			toast.error('Failed to send follow request');
		} finally {
			setProcessingRequests(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

	// Accept follow request
	const handleAcceptRequest = async (userId: string) => {
		if (processingRequests.has(userId)) return;

		try {
			setProcessingRequests(prev => new Set(prev).add(userId));
			const token = localStorage.getItem('accessToken');

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}/accept`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				setRequestReceivedUsers(prev => {
					const newSet = new Set(prev);
					newSet.delete(userId);
					return newSet;
				});
				setFollowingUsers(prev => new Set(prev).add(userId));
				toast.success('Follow request accepted');
				fetchUsers(); // <-- refetch
			} else {
				toast.error(data.message || 'Failed to accept follow request');
			}
		} catch (error) {
			console.error('Error accepting follow request:', error);
			toast.error('Failed to accept follow request');
		} finally {
			setProcessingRequests(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

	// Decline follow request
	const handleDeclineRequest = async (userId: string) => {
		if (processingRequests.has(userId)) return;

		try {
			setProcessingRequests(prev => new Set(prev).add(userId));
			const token = localStorage.getItem('accessToken');

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}/decline`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				setRequestReceivedUsers(prev => {
					const newSet = new Set(prev);
					newSet.delete(userId);
					return newSet;
				});
				toast.success('Follow request declined');
				fetchUsers(); // <-- refetch
			} else {
				toast.error(data.message || 'Failed to decline follow request');
			}
		} catch (error) {
			console.error('Error declining follow request:', error);
			toast.error('Failed to decline follow request');
		} finally {
			setProcessingRequests(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

	// Unfollow user
	const handleUnfollow = async (userId: string) => {
		if (processingRequests.has(userId)) return;

		try {
			setProcessingRequests(prev => new Set(prev).add(userId));
			const token = localStorage.getItem('accessToken');

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				setFollowingUsers(prev => {
					const newSet = new Set(prev);
					newSet.delete(userId);
					return newSet;
				});
				toast.success('User unfollowed');
				fetchUsers(); // <-- refetch
			} else {
				toast.error(data.message || 'Failed to unfollow user');
			}
		} catch (error) {
			console.error('Error unfollowing user:', error);
			toast.error('Failed to unfollow user');
		} finally {
			setProcessingRequests(prev => {
				const newSet = new Set(prev);
				newSet.delete(userId);
				return newSet;
			});
		}
	};

	// Format time ago
	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		return `${Math.floor(diffInDays / 30)} months ago`;
	};

	// Get user initials for avatar fallback
	const getUserInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	useEffect(() => {
		fetchUsers();
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return (
			<div className='h-full rounded-lg bg-zinc-900 p-4 flex flex-col items-center justify-center'>
				<Users className='size-12 text-zinc-600 mb-4' />
				<p className='text-zinc-400 text-center text-sm'>
					Sign in to discover and connect with other music lovers
				</p>
			</div>
		);
	}

	return (
		<div className='h-full rounded-lg bg-zinc-900 p-4 flex flex-col'>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center gap-2'>
					<Users className='size-5 text-white' />
					<h2 className='text-white font-semibold'>Discover People</h2>
				</div>
				<span className='text-xs text-zinc-400'>{users.filter(user => user.email !== ADMIN_EMAIL).length} users</span>
			</div>

			<ScrollArea className='flex-1'>
				<div className='space-y-3'>
					{isLoading ? (
						// Loading skeleton
						Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className='flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 animate-pulse'>
								<div className='size-10 rounded-full bg-zinc-700'></div>
								<div className='flex-1'>
									<div className='h-4 bg-zinc-700 rounded mb-2'></div>
									<div className='h-3 bg-zinc-700 rounded w-2/3'></div>
								</div>
								<div className='w-16 h-8 bg-zinc-700 rounded'></div>
							</div>
						))
					) : users.filter(user => user.email !== ADMIN_EMAIL).length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<Users className='size-12 text-zinc-600 mb-4' />
							<h3 className='text-lg font-medium text-white mb-2'>No users found</h3>
							<p className='text-sm text-zinc-400 max-w-48'>
								Be the first to join this music community!
							</p>
						</div>
					) : (
						users.filter(user => user.email !== ADMIN_EMAIL).map((user) => (
							<div key={user.id} className='flex items-start gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors group'>
								{/* Avatar */}
								<div className='relative flex-shrink-0'>
									{user.picture ? (
										<img
											src={user.picture}
											alt={user.name}
											className='size-10 rounded-full object-cover'
										/>
									) : (
										<div className='size-10 rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center text-white font-semibold text-sm'>
											{getUserInitials(user.firstName, user.lastName)}
										</div>
									)}
									{/* Online indicator */}
									{user.isOnline && (
										<div className='absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-zinc-900'></div>
									)}
								</div>

								{/* User info and follow button */}
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<p className='text-white text-sm font-medium truncate'>
											{user.firstName} {user.lastName}
										</p>
										{user.accountType === 'premium' && (
											<Crown className='size-3 text-yellow-500' />
										)}
									</div>

									{/* Follow button under name */}
									<div className='mb-2'>
										{user.friendStatus === 'friends' ? (
											<div className='flex gap-2'>
												<button
													onClick={() => handleUnfollow(user.id)}
													className='px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 bg-zinc-800 text-white border border-zinc-600 hover:bg-red-600 hover:border-red-600 hover:text-white group'
												>
													<UserCheck className='size-3 group-hover:hidden' />
													<UserX className='size-3 hidden group-hover:block' />
													<span className='group-hover:hidden'>Following</span>
													<span className='hidden group-hover:block'>Unfollow</span>
												</button>
												<button
													onClick={() => navigate(`/messages?friendId=${user.id}`)}
													className='px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105 shadow-lg hover:shadow-green-500/25'
												>
													<Send className='size-3' />
													<span>Message</span>
												</button>
											</div>
										) : user.friendStatus === 'request_sent' ? (
											<button
												className='px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-orange-600 text-white cursor-not-allowed opacity-70'
												disabled
											>
												<ClockIcon className='size-3' />
												<span>Requested</span>
											</button>
										) : user.friendStatus === 'request_received' ? (
											<div className='flex gap-2'>
												<button
													onClick={() => handleAcceptRequest(user.id)}
													className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700 hover:scale-105 ${processingRequests.has(user.id) ? 'cursor-not-allowed opacity-70' : ''}`}
													disabled={processingRequests.has(user.id)}
												>
													<UserCheck className='size-3' />
													<span>Accept</span>
												</button>
												<button
													onClick={() => handleDeclineRequest(user.id)}
													className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 hover:scale-105 ${processingRequests.has(user.id) ? 'cursor-not-allowed opacity-70' : ''}`}
													disabled={processingRequests.has(user.id)}
												>
													<UserX className='size-3' />
													<span>Reject</span>
												</button>
											</div>
										) : (
											<button
												onClick={() => handleFollowRequest(user.id)}
												className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
													processingRequests.has(user.id)
														? 'bg-zinc-700 text-white cursor-not-allowed opacity-70'
														: 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105'
												}`}
												disabled={processingRequests.has(user.id)}
											>
												<UserPlus className='size-3' />
												<span>Follow</span>
											</button>
										)}
									</div>

									<div className='flex items-center gap-2 text-xs text-zinc-400'>
										<span className='truncate'>@{user.email.split('@')[0]}</span>
										{user.followersCount > 0 && (
											<>
												<span>•</span>
												<span>{user.followersCount} followers</span>
											</>
										)}
									</div>
									{user.lastSeen && (
										<div className='flex items-center gap-1 text-xs text-zinc-500 mt-1'>
											<Clock className='size-3' />
											<span>{user.isOnline ? 'Online' : `Active ${getTimeAgo(user.lastSeen)}`}</span>
										</div>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			{/* Footer */}
			<div className='mt-4 pt-4 border-t border-zinc-800'>
				<p className='text-xs text-zinc-500 text-center'>
					{users.filter(user => user.email !== ADMIN_EMAIL).length > 0
						? 'Connect with fellow music enthusiasts'
						: 'Discover new friends who share your music taste'
					}
				</p>
			</div>
		</div>
	);
};

export default FriendsActivity;