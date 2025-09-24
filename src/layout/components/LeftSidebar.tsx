import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCustomAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { HomeIcon, Library, MessageCircle, Heart, BarChart2, Search, Users, Settings, ChevronLeft, Download, ChevronDown, ChevronUp, Music2, Wallet2, Megaphone, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import FallbackImage from "@/components/FallbackImage";
import apiService from "@/services/api";


type SongItem = {
	_id?: string;
	title: string;
	artist?: string;
	imageUrl?: string;
};

const LeftSidebar = ({ onCollapse }: { onCollapse?: () => void }) => {
	const { isAuthenticated } = useCustomAuth();
	const { userProfile } = useUserProfile();
	const [isLoading, setIsLoading] = useState(false);
	const [recentSongs, setRecentSongs] = useState<SongItem[]>([]);
	const [showAllNav, setShowAllNav] = useState(false);

	const recentSearches = useMemo<string[]>(() => {
		try {
			const saved = localStorage.getItem('recentSearches');
			const arr = saved ? JSON.parse(saved) : [];
			return Array.isArray(arr) ? arr : [];
		} catch {
			return [];
		}
	}, []);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			setIsLoading(true);
			try {
				const queries = [...recentSearches].reverse().slice(0, 5);
				const results = await Promise.all(
					queries.map(q => apiService.searchMusic(q, 'song', 5, 'local'))
				);
				const songs: SongItem[] = results.flatMap((res, idx) => {
					const list = (res?.songs || res || []) as any[];
					return list.slice(0, 3).map((s: any) => ({
						_id: s._id || `${queries[idx]}-${s.title}-${s.artist}`,
						title: s.title,
						artist: s.artist,
						imageUrl: s.imageUrl,
					}));
				});
				// Deduplicate by id or title-artist combo to avoid duplicate keys
				const seen = new Set<string>();
				const uniqueSongs = songs.filter((s) => {
					const key = s._id || `${s.title}-${s.artist || ''}`;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				});
				if (isMounted) setRecentSongs(uniqueSongs);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};
		load();
		return () => { isMounted = false; };
	}, [recentSearches]);

	return (
		<div className='h-full flex flex-col gap-2 overflow-auto min-h-0'>
			{/* Navigation menu */}
			<div className='rounded-lg bg-zinc-900 p-4 flex-shrink-0'>
				<div className='space-y-2'>
					<button
						onClick={onCollapse}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
						aria-label='Collapse sidebar'
					>
						<ChevronLeft className='mr-2 size-5' />
					</button>

					{(() => {
						const navItems: ReactElement[] = [];
						navItems.push(
							<Link
								key="home"
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
						);
						navItems.push(
							<Link
								key="search"
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
						);

						if (isAuthenticated) {
							// Messages should be 3rd
							navItems.push(
								<Link
									key="messages"
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
							);
							// Followed by Liked, Activity, Artists
							navItems.push(
								<Link
									key="liked"
									to={"/liked"}
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
							);
							navItems.push(
								<Link
									key="profile"
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
							);
							navItems.push(
								<Link
									key="artists"
									to={"/artists"}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-start text-white hover:bg-zinc-800",
										})
									)}
								>
									<Users className='mr-2 size-5' />
									<span className='hidden md:inline'>Artists</span>
								</Link>
							);
						// If artist, show Artist-specific menus directly
						if ((userProfile as any)?.isArtist) {
							const artistLinks = [
								{ key: 'artist-overview', to: '/artist', label: 'Artist Overview', icon: BarChart2 },
								{ key: 'artist-music', to: '/artist/music', label: 'Music', icon: Music2 },
								{ key: 'artist-analytics', to: '/artist/analytics', label: 'Analytics', icon: BarChart2 },
								{ key: 'artist-audience', to: '/artist/audience', label: 'Audience', icon: Users },
								{ key: 'artist-revenue', to: '/artist/revenue', label: 'Revenue', icon: Wallet2 },
								{ key: 'artist-marketing', to: '/artist/marketing', label: 'Marketing', icon: Megaphone },
								{ key: 'artist-fans', to: '/artist/fans', label: 'Fans', icon: MessageSquare },
								{ key: 'artist-settings', to: '/artist/settings', label: 'Artist Settings', icon: Settings },
							];
							artistLinks.forEach(({ key, to, label, icon: Icon }) => {
								navItems.push(
									<Link
										key={key}
										to={to}
										className={cn(
											buttonVariants({
												variant: "ghost",
												className: "w-full justify-start text-white hover:bg-zinc-800",
											})
										)}
									>
										<Icon className='mr-2 size-5' />
										<span className='hidden md:inline'>{label}</span>
									</Link>
								);
							});
						}

						// Downloads should be 7th
							navItems.push(
								<Link
									key="downloads"
									to={("/downloads")}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-start text-white hover:bg-zinc-800",
										})
									)}
								>
									<Download className='mr-2 size-5' />
									<span className='hidden md:inline'>Downloads</span>
								</Link>
							);
							navItems.push(
								<Link
									key="settings"
									to={"/settings-menu"}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-start text-white hover:bg-zinc-800",
										})
									)}
								>
									<Settings className='mr-2 size-5' />
									<span className='hidden md:inline'>Settings</span>
								</Link>
							);
						}

						const visibleItems = showAllNav ? navItems : navItems.slice(0, 4);
						return (
							<>
								{visibleItems}
								{navItems.length > 4 && (
									<button
										onClick={() => setShowAllNav((v) => !v)}
										className={cn(
											buttonVariants({
												variant: "ghost",
												className: "w-full justify-start text-white hover:bg-zinc-800",
											})
										)}
										aria-expanded={showAllNav}
									>
										{showAllNav ? (
											<>
												<ChevronUp className='mr-2 size-5' />
												<span className='hidden md:inline'>Show less</span>
											</>
										) : (
											<>
												<ChevronDown className='mr-2 size-5' />
												<span className='hidden md:inline'>Show more</span>
											</>
										)}
									</button>
								)}
							</>
						);
					})()}
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
							recentSongs.map((song, index) => (
								<div
									key={song._id || `${song.title}-${index}`}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<div className="size-12 rounded-md flex-shrink-0 overflow-hidden relative">
										<FallbackImage
											src={(song.imageUrl || '')}
											alt={song.title}
											className="size-12 rounded-md"
											fallbackSeed={song.title}
										/>
									</div>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{song.title}</p>
										<p className='text-sm text-zinc-400 truncate'>Song • {song.artist || 'Unknown'}</p>
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