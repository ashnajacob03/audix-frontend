import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@clerk/clerk-react";
import { Users, Music } from "lucide-react";

const FriendsActivity = () => {
	const { isSignedIn } = useAuth();

	// Friends activity data (empty - ready for backend integration)
	const friendsActivity: any[] = [];

	if (!isSignedIn) {
		return (
			<div className='h-full rounded-lg bg-zinc-900 p-4 flex flex-col items-center justify-center'>
				<Users className='size-12 text-zinc-600 mb-4' />
				<p className='text-zinc-400 text-center text-sm'>
					Sign in to see what your friends are listening to
				</p>
			</div>
		);
	}

	return (
		<div className='h-full rounded-lg bg-zinc-900 p-4 flex flex-col'>
			<div className='flex items-center gap-2 mb-4'>
				<Users className='size-5 text-white' />
				<h2 className='text-white font-semibold'>Friend Activity</h2>
			</div>

			<ScrollArea className='flex-1'>
				<div className='space-y-4'>
					{friendsActivity.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<Music className='size-12 text-zinc-600 mb-4' />
							<h3 className='text-lg font-medium text-white mb-2'>No activity yet</h3>
							<p className='text-sm text-zinc-400 max-w-48'>
								When your friends listen to music, their activity will appear here.
							</p>
						</div>
					) : (
						friendsActivity.map((friend) => (
							<div key={friend.id} className='flex items-start gap-3 p-2 hover:bg-zinc-800 rounded-md cursor-pointer'>
								<img
									src={friend.avatar}
									alt={friend.name}
									className='size-8 rounded-full flex-shrink-0'
								/>
								<div className='flex-1 min-w-0'>
									<p className='text-white text-sm font-medium truncate'>{friend.name}</p>
									<div className='flex items-center gap-1 text-xs text-zinc-400'>
										<Music className='size-3' />
										<span className='truncate'>{friend.activity}</span>
									</div>
									<p className='text-xs text-zinc-500 truncate'>{friend.artist}</p>
									<p className='text-xs text-zinc-500 mt-1'>{friend.time}</p>
								</div>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			<div className='mt-4 pt-4 border-t border-zinc-800'>
				<p className='text-xs text-zinc-500 text-center'>
					{friendsActivity.length === 0
						? 'Add friends to see their music activity'
						: 'Stay connected with your friends'
					}
				</p>
			</div>
		</div>
	);
};

export default FriendsActivity;