import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomAuth } from "@/contexts/AuthContext";
import { Users, Music, UserPlus, UserCheck, Clock, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

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
}

const FriendsActivity = () => {
	const { isAuthenticated, user: currentUser } = useCustomAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

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
				// Initialize following state
				const following = new Set(
					data.data.users
						.filter((user: User) => user.isFollowing)
						.map((user: User) => user.id)
				);
				setFollowingUsers(following);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Failed to load users');
		} finally {
			setIsLoading(false);
		}
	};

	// Follow/Unfollow user
	const handleFollowToggle = async (userId: string) => {
		try {
			const token = localStorage.getItem('accessToken');
			const isCurrentlyFollowing = followingUsers.has(userId);
			const method = isCurrentlyFollowing ? 'DELETE' : 'POST';

			const response = await fetch(`${API_BASE_URL}/user/follow/${userId}`, {
				method,
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			if (data.success) {
				// Update local state
				const newFollowingUsers = new Set(followingUsers);
				if (isCurrentlyFollowing) {
					newFollowingUsers.delete(userId);
					toast.success('User unfollowed');
				} else {
					newFollowingUsers.add(userId);
					toast.success('User followed');
				}
				setFollowingUsers(newFollowingUsers);

				// Update user's followers count
				setUsers(prevUsers =>
					prevUsers.map(user =>
						user.id === userId
							? {
								...user,
								followersCount: isCurrentlyFollowing
									? user.followersCount - 1
									: user.followersCount + 1,
								isFollowing: !isCurrentlyFollowing
							}
							: user
					)
				);
			} else {
				toast.error(data.message || 'Failed to update follow status');
			}
		} catch (error) {
			console.error('Error toggling follow:', error);
			toast.error('Failed to update follow status');
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
				<span className='text-xs text-zinc-400'>{users.length} users</span>
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
					) : users.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<Users className='size-12 text-zinc-600 mb-4' />
							<h3 className='text-lg font-medium text-white mb-2'>No users found</h3>
							<p className='text-sm text-zinc-400 max-w-48'>
								Be the first to join this music community!
							</p>
						</div>
					) : (
						users.map((user) => (
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
										<button
											onClick={() => handleFollowToggle(user.id)}
											className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
												followingUsers.has(user.id)
													? 'bg-zinc-700 text-white hover:bg-red-600 hover:text-white'
													: 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105'
											}`}
										>
											{followingUsers.has(user.id) ? (
												<>
													<UserCheck className='size-3' />
													<span className='hidden group-hover:inline'>Unfollow</span>
													<span className='group-hover:hidden'>Following</span>
												</>
											) : (
												<>
													<UserPlus className='size-3' />
													<span>Follow</span>
												</>
											)}
										</button>
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
					{users.length > 0
						? 'Connect with fellow music enthusiasts'
						: 'Discover new friends who share your music taste'
					}
				</p>
			</div>
		</div>
	);
};

export default FriendsActivity;