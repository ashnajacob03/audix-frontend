import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCustomAuth } from "@/contexts/AuthContext";
import { HomeIcon, Library, MessageCircle, Heart, BarChart2, Search, Music } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import FallbackImage from "@/components/FallbackImage";

const LeftSidebar = () => {
	const { isAuthenticated } = useCustomAuth();
	const [isLoading] = useState(false);

	// Mock playlists data - you can replace this with actual data
	const playlists = [
		{
			id: "1",
			title: "Yoga Vibes",
			description: "Vibrations, Meditation, Roxette and more",
			author: "Your Library",
			color: "from-purple-500 to-pink-600",
			imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center" // Yoga/meditation scene
		},
		{
			id: "2",
			title: "Daily Mix 1",
			description: "Sound Bath, Emilian...",
			author: "Your Library",
			color: "from-blue-500 to-cyan-600",
			imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center" // Vinyl records
		},
		{
			id: "3",
			title: "StreamBeats - EDM",
			description: "StreamBeats Official Playlist",
			author: "Your Library",
			color: "from-red-500 to-orange-600",
			imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center" // DJ/Electronic music setup
		},
		{
			id: "4",
			title: "StreamBeats - Synthwave",
			description: "THE LIFE BREAKS EXPERIENCE",
			author: "Your Library",
			color: "from-indigo-500 to-purple-600",
			imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center" // Neon/synthwave aesthetic
		},
		{
			id: "5",
			title: "GOING PROYOGA",
			description: "MONOCLE RADIO PODCAST",
			author: "Your Library",
			color: "from-green-500 to-emerald-600",
			imageUrl: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400&h=400&fit=crop&crop=center" // Peaceful yoga/nature
		},
		{
			id: "6",
			title: "StreamBeats - Lofi",
			description: "Only A Dream - Beatsole, Kimberly Hale",
			author: "Your Library",
			color: "from-yellow-500 to-orange-600",
			imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center" // Cozy headphones/lofi vibe
		},
		{
			id: "7",
			title: "Test Fallback",
			description: "This will show fallback image",
			author: "Your Library",
			color: "from-gray-500 to-slate-600",
			imageUrl: "https://broken-url-for-testing.com/image.jpg" // Intentionally broken URL
		},
	];

	return (
		<div className='h-full flex flex-col gap-2 overflow-hidden'>
			{/* Navigation menu */}
			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to={"/"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>

					<Link
						to={"/search"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Search className='mr-2 size-5' />
						<span className='hidden md:inline'>Search</span>
					</Link>

					{isAuthenticated && (
						<>
							<Link
								to={"/dashboard"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800",
									})
								)}
							>
								<Heart className='mr-2 size-5' />
								<span className='hidden md:inline'>Liked Songs</span>
							</Link>

							<Link
								to={"/profile"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800",
									})
								)}
							>
								<BarChart2 className='mr-2 size-5' />
								<span className='hidden md:inline'>Activity</span>
							</Link>

							<Link
								to={"/messages"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-start text-white hover:bg-zinc-800",
									})
								)}
							>
								<MessageCircle className='mr-2 size-5' />
								<span className='hidden md:inline'>Messages</span>
							</Link>
						</>
					)}
				</div>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-4 overflow-hidden flex flex-col min-h-0'>
				<div className='flex items-center justify-between mb-4 flex-shrink-0'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Your Library</span>
					</div>
				</div>

				<ScrollArea className='flex-1 min-h-0'>
					<div className='space-y-2 pr-4'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							playlists.map((playlist) => (
								<div
									key={playlist.id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<div className="size-12 rounded-md flex-shrink-0 overflow-hidden relative">
										<FallbackImage
											src={playlist.imageUrl}
											alt={playlist.title}
											className="size-12 rounded-md"
											fallbackSeed={playlist.id}
										/>
										{/* Subtle gradient overlay for better visual consistency */}
										<div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-20 rounded-md`}></div>
									</div>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{playlist.title}</p>
										<p className='text-sm text-zinc-400 truncate'>Playlist • {playlist.author}</p>
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;