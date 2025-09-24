import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomAuth } from "@/contexts/AuthContext";
import { Users, UserPlus, UserCheck, Crown, UserX, Send, Clock as ClockIcon, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import UserAvatar from "@/components/UserAvatar";

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

const FriendsActivity = ({ onCollapse }: { onCollapse?: () => void }) => {
	const { isAuthenticated } = useCustomAuth();
	const navigate = useNavigate();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
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

	// (debug-only utilities removed in production UI)

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

	// Cancel follow request
	const handleCancelRequest = async (userId: string) => {
		if (processingRequests.has(userId)) return;

		try {
			setProcessingRequests(prev => new Set(prev).add(userId));
			const token = localStorage.getItem('accessToken');

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}/cancel`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				toast.success('Follow request cancelled');
				fetchUsers(); // <-- refetch
			} else {
				toast.error(data.message || 'Failed to cancel follow request');
			}
		} catch (error) {
			console.error('Error cancelling follow request:', error);
			toast.error('Failed to cancel follow request');
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
        <div className='h-full rounded-xl bg-gradient-to-b from-zinc-900 to-black p-4 flex flex-col border border-zinc-800/60 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
            <div className='flex items-center justify-between mb-4'>
				<div className='flex items-center gap-2'>
					<Users className='size-5 text-white' />
					<h2 className='text-white font-semibold tracking-tight'>Discover People</h2>
				</div>
                <div className='flex items-center gap-2'>
                    <span className='text-xs text-zinc-400 bg-zinc-800/70 border border-zinc-700/60 px-2 py-0.5 rounded-full'>
                        {users.filter(user => user.email !== ADMIN_EMAIL).length} users
                    </span>
                    <button
                        onClick={onCollapse}
                        className='p-1.5 rounded-md hover:bg-zinc-800/70 text-zinc-300 border border-transparent hover:border-zinc-700'
                        aria-label='Collapse sidebar'
                    >
                        <ChevronRight className='size-4' />
                    </button>
                </div>
			</div>

			<ScrollArea className='flex-1'>
				<div className='space-y-6'>
					{isLoading ? (
						// Loading skeleton
						Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className='flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse'>
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
						<>
							{/* Following People Section */}
							{(() => {
								const followingUsers = users.filter(user => 
									user.email !== ADMIN_EMAIL && user.friendStatus === 'friends'
								);
								if (followingUsers.length > 0) {
									return (
								<div>
									<div className='flex items-center gap-2 mb-3'>
												<UserCheck className='size-4 text-green-500' />
										<h3 className='text-xs font-semibold uppercase tracking-wider text-green-500'>Following People</h3>
										<span className='text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-full'>
													{followingUsers.length}
												</span>
											</div>
									<div className='space-y-3'>
												{followingUsers.map((user) => (
											<div key={user.id} className='flex items-start gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors group'>
														{/* Avatar */}
												<div className='relative flex-shrink-0'>
															<UserAvatar 
																size="md" 
																src={user.picture} 
																firstName={user.firstName} 
																lastName={user.lastName}
																showOnlineStatus={user.isOnline}
															/>
														</div>

														{/* User info and follow button */}
														<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2 mb-1'>
											<div className='flex items-center gap-2 min-w-0'>
												<p className='text-white text-sm font-medium truncate'>
													{user.firstName} {user.lastName}
												</p>
												{user.accountType === 'premium' && (
													<Crown className='size-3 text-yellow-500' />
												)}
											</div>
										</div>

										{/* Followed: action buttons under name */}
												<div className='mb-2'>
											<div className='flex gap-2'>
																	<button
																		onClick={() => handleUnfollow(user.id)}
															className='px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 bg-zinc-900 text-white border border-zinc-700 hover:bg-red-600 hover:border-red-600 group'
																	>
																		<UserCheck className='size-3 group-hover:hidden' />
																		<UserX className='size-3 hidden group-hover:block' />
																		<span className='group-hover:hidden'>Following</span>
																		<span className='hidden group-hover:block'>Unfollow</span>
																	</button>
																	<button
																		onClick={() => navigate(`/messages?friendId=${user.id}`)}
													className='px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 bg-[#1db954] text-black hover:bg-[#1ed760] hover:scale-105'
																	>
																		<Send className='size-3' />
																		<span>Message</span>
																	</button>
																</div>
															</div>

										{/* Meta hidden per request */}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							})()}

							{/* Requested People Section */}
							{(() => {
								const requestedUsers = users.filter(user => 
									user.email !== ADMIN_EMAIL && user.friendStatus === 'request_sent'
								);
								if (requestedUsers.length > 0) {
									return (
									<div>
										<div className='flex items-center gap-2 mb-3'>
												<ClockIcon className='size-4 text-orange-500' />
											<h3 className='text-xs font-semibold uppercase tracking-wider text-orange-500'>Requested People</h3>
											<span className='text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-full'>
													{requestedUsers.length}
												</span>
											</div>
										<div className='space-y-3'>
												{requestedUsers.map((user) => (
												<div key={user.id} className='flex items-start gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors group'>
														{/* Avatar */}
														<div className='relative flex-shrink-0'>
															<UserAvatar 
																size="md" 
																src={user.picture} 
																firstName={user.firstName} 
																lastName={user.lastName}
																showOnlineStatus={user.isOnline}
															/>
														</div>

														{/* User info and follow button */}
														<div className='flex-1 min-w-0'>

									<div className='flex items-center justify-between gap-2 mb-1'>
										<div className='flex items-center gap-2 min-w-0'>
											<p className='text-white text-sm font-medium truncate'>
												{user.firstName} {user.lastName}
											</p>
											{user.accountType === 'premium' && (
												<Crown className='size-3 text-yellow-500' />
											)}
										</div>
										<div className='flex-shrink-0'>
											<button
												onClick={() => handleCancelRequest(user.id)}
												className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 ${
													processingRequests.has(user.id) 
														? 'bg-zinc-800 text-white cursor-not-allowed opacity-70' 
														: 'bg-orange-600 text-white hover:bg-red-600 hover:scale-105 group'
												}`}
												disabled={processingRequests.has(user.id)}
											>
												<ClockIcon className='size-3 group-hover:hidden' />
												<UserX className='size-3 hidden group-hover:block' />
												<span className='group-hover:hidden'>Requested</span>
												<span className='hidden group-hover:block'>Cancel</span>
											</button>
										</div>
									</div>

									{/* Meta hidden per request */}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							})()}

							{/* Not Following People Section */}
							{(() => {
								const notFollowingUsers = users.filter(user => 
									user.email !== ADMIN_EMAIL && 
									(user.friendStatus === 'none' || user.friendStatus === 'request_received')
								);
								if (notFollowingUsers.length > 0) {
									return (
										<div>
											<div className='flex items-center gap-2 mb-3'>
												<UserPlus className='size-4 text-blue-500' />
												<h3 className='text-xs font-semibold uppercase tracking-wider text-blue-500'>Discover New People</h3>
												<span className='text-[10px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded-full'>
													{notFollowingUsers.length}
												</span>
											</div>
											<div className='space-y-3'>
												{notFollowingUsers.map((user) => (
													<div key={user.id} className='flex items-start gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors group'>
														{/* Avatar */}
														<div className='relative flex-shrink-0'>
															<UserAvatar 
																size="md" 
																src={user.picture} 
																firstName={user.firstName} 
																lastName={user.lastName}
																showOnlineStatus={user.isOnline}
															/>
														</div>

														{/* User info and follow button */}
														<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between gap-2 mb-1'>
											<div className='flex items-center gap-2 min-w-0'>
												<p className='text-white text-sm font-medium truncate'>
													{user.firstName} {user.lastName}
												</p>
												{user.accountType === 'premium' && (
													<Crown className='size-3 text-yellow-500' />
												)}
											</div>
											<div className='flex-shrink-0'>
												{user.friendStatus === 'request_received' ? (
													<div className='flex gap-2'>
														<button
															onClick={() => handleAcceptRequest(user.id)}
															className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700 hover:scale-105 ${processingRequests.has(user.id) ? 'cursor-not-allowed opacity-70' : ''}`}
															disabled={processingRequests.has(user.id)}
														>
															<UserCheck className='size-3' />
															<span>Accept</span>
														</button>
														<button
															onClick={() => handleDeclineRequest(user.id)}
															className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 hover:scale-105 ${processingRequests.has(user.id) ? 'cursor-not-allowed opacity-70' : ''}`}
															disabled={processingRequests.has(user.id)}
														>
															<UserX className='size-3' />
															<span>Reject</span>
														</button>
													</div>
												) : (
													<button
															onClick={() => handleFollowRequest(user.id)}
															className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
																processingRequests.has(user.id)
																	? 'bg-zinc-800 text-white cursor-not-allowed opacity-70'
																	: 'bg-[#1db954] text-black hover:bg-[#1ed760] hover:scale-105'
															}`}
															disabled={processingRequests.has(user.id)}
														>
															<UserPlus className='size-3' />
															<span>Follow</span>
														</button>
												)}
											</div>
										</div>

									{/* Meta hidden per request */}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							})()}
						</>
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