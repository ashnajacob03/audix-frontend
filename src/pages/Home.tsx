import React, { useEffect, useMemo, useState } from "react";
import AudixTopbar from "@/components/AudixTopbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongCard from "@/components/SongCard";
import apiService from "@/services/api";

import { 
	Heart, 
	Music, 
	Zap, 
	Coffee, 
	HeartCrack, 
	Sparkles, 
	PartyPopper, 
	Smile, 
	Headphones,
	Loader2
} from "lucide-react";

// Mood icon mapping
const MOOD_ICONS: Record<string, React.ComponentType<any>> = {
	happy: Smile,
	sad: HeartCrack,
	energetic: Zap,
	focus: Coffee,
	heartbreak: HeartCrack,
	relax: Headphones,
	love: Heart,
	feel_good: Sparkles,
	party: PartyPopper,
	chill: Music
};

// Mood color mapping
const MOOD_COLORS: Record<string, string> = {
	happy: "from-yellow-500 to-amber-600",
	sad: "from-blue-500 to-indigo-600",
	energetic: "from-red-500 to-orange-600",
	focus: "from-slate-500 to-slate-700",
	heartbreak: "from-pink-500 to-purple-600",
	relax: "from-teal-500 to-green-600",
	love: "from-pink-500 to-rose-600",
	feel_good: "from-green-500 to-emerald-600",
	party: "from-purple-500 to-violet-600",
	chill: "from-blue-500 to-cyan-600"
};

// Map moods to genre keywords for API fetching
const MOOD_GENRE_MAP: Record<string, string> = {
	happy: "pop",
	sad: "acoustic",
	energetic: "dance",
	focus: "chill",
	heartbreak: "sad",
	relax: "ambient",
	love: "romance",
	feel_good: "indie",
	party: "party",
	chill: "chill"
};

// API song item type
interface SongItem {
	_id: string;
	title: string;
	artist: string;
	imageUrl?: string;
	duration?: number;
	previewUrl?: string;
}

const availableMoods = [
	{ value: "happy", label: "Happy" },
	{ value: "sad", label: "Sad" },
	{ value: "energetic", label: "Energetic" },
	{ value: "relax", label: "Relax" },
	{ value: "party", label: "Party" }
];

const fallbackImage = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&crop=center";
const normalizeSongForCard = (song: any) => ({
	...song,
	imageUrl: song?.imageUrl || fallbackImage,
});

const Home = () => {
	const [activeTab, setActiveTab] = useState("all");
	const [featuredSongs, setFeaturedSongs] = useState<SongItem[]>([]);
	const [madeForYouSongs, setMadeForYouSongs] = useState<SongItem[]>([]);
	const [trendingSongs, setTrendingSongs] = useState<SongItem[]>([]);
	const [moodSongs, setMoodSongs] = useState<Record<string, SongItem[]>>({});
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const recentSearches = useMemo<string[]>(() => {
		try {
			const saved = localStorage.getItem('recentSearches');
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	}, []);

	useEffect(() => {
		let isMounted = true;
		const loadHomeData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const q1 = recentSearches[0];
				const q2 = recentSearches[1];
				const [featRes, madeRes, trendRes] = await Promise.all([
					q1 ? apiService.searchMusic(q1, 'song', 10, 'local') : apiService.getPopularSongs(10),
					q2 ? apiService.searchMusic(q2, 'song', 10, 'local') : apiService.getPopularSongs(10),
					apiService.getPopularSongs(10)
				]);

				const featSongs = (featRes?.songs || featRes || []).slice(0, 5);
				const madeSongs = (madeRes?.songs || madeRes || []).slice(0, 10);
				const trendSongs = (trendRes?.songs || trendRes || []).slice(0, 10);

				if (!isMounted) return;
				setFeaturedSongs(featSongs as SongItem[]);
				setMadeForYouSongs(madeSongs as SongItem[]);
				setTrendingSongs(trendSongs as SongItem[]);
			} catch (e: any) {
				if (!isMounted) return;
				setError(e?.message || 'Failed to load songs');
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		loadHomeData();
		return () => { isMounted = false; };
	}, [recentSearches]);

	// Preload a few songs for each mood (shown in "All" view)
	useEffect(() => {
		let isMounted = true;
		const fetchMoods = async () => {
			try {
				const map: Record<string, SongItem[]> = {};
				for (const m of availableMoods) {
					const genre = MOOD_GENRE_MAP[m.value] || m.value;
					try {
						const list = await apiService.getSongsByGenre(genre, 3);
						map[m.value] = (list?.songs || list || []) as SongItem[];
					} catch {
						map[m.value] = [];
					}
					// small delay to avoid hammering server
					await new Promise((r) => setTimeout(r, 150));
				}
				if (!isMounted) return;
				setMoodSongs(map);
			} catch {
				// ignore
			}
		};
		fetchMoods();
		return () => { isMounted = false; };
	}, []);

	// Function to get user-friendly mood name
	const getMoodLabel = (mood: string) => {
		const foundMood = availableMoods.find(m => m.value === mood);
		return foundMood ? foundMood.label : mood.charAt(0).toUpperCase() + mood.slice(1).replace('_', ' ');
	};

	// Render mood card component
	const MoodCard = ({ mood, isActive, onClick }: { mood: string, isActive: boolean, onClick: () => void }) => {
		const MoodIcon = MOOD_ICONS[mood] || Music;
		const colorClass = MOOD_COLORS[mood] || "from-gray-700 to-gray-800";
		
		return (
			<div 
				onClick={onClick}
				className={`
					cursor-pointer rounded-xl overflow-hidden transition-all duration-300
					${isActive ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100 hover:scale-105'}
				`}
			>
				<div className={`bg-gradient-to-br ${colorClass} p-4 h-full flex flex-col items-center justify-center`}>
					<MoodIcon className="h-10 w-10 mb-2" />
					<span className="font-semibold text-center">{getMoodLabel(mood)}</span>
				</div>
			</div>
		);
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<AudixTopbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            Listen to your favorite songs
          </h1>

					{isLoading && (
						<div className="flex items-center gap-3 text-zinc-400 mb-6">
							<Loader2 className="h-5 w-5 animate-spin" />
							Loading songs...
						</div>
					)}

					{error && (
						<div className="text-sm text-red-400 mb-4">{error}</div>
					)}

					{/* Featured Section */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold">Featured</h2>
							<span className="text-sm text-zinc-400 hover:text-white cursor-pointer">
								Show all
							</span>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{featuredSongs.map(song => (
								<SongCard key={song._id} song={normalizeSongForCard(song)} />
							))}
						</div>
					</div>

					{/* Main music sections */}
					<div className='space-y-8'>
						{/* Made For You */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">Made For You</h2>
								<span className="text-sm text-zinc-400 hover:text-white cursor-pointer">
									Show all
								</span>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{madeForYouSongs.map(song => (
									<SongCard key={song._id} song={normalizeSongForCard(song)} />
								))}
							</div>
						</div>

						{/* Trending */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">Trending</h2>
								<span className="text-sm text-zinc-400 hover:text-white cursor-pointer">
									Show all
								</span>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{trendingSongs.map(song => (
									<SongCard key={song._id} song={normalizeSongForCard(song)} />
								))}
							</div>
						</div>
					</div>

					{/* Mood-based sections with visual cards */}
					<div className="mt-10 mb-12">
						<h2 className="text-xl sm:text-2xl font-bold mb-6">Browse by Mood</h2>
						
						{/* Mood Cards Grid */}
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
							<div 
								onClick={() => setActiveTab("all")}
								className={`
									cursor-pointer rounded-xl overflow-hidden transition-all duration-300
									${activeTab === "all" ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100 hover:scale-105'}
								`}
							>
								<div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 h-full flex flex-col items-center justify-center">
									<Music className="h-10 w-10 mb-2" />
									<span className="font-semibold text-center">All</span>
								</div>
							</div>
							
							{availableMoods.map((mood) => (
								<MoodCard 
									key={mood.value} 
									mood={mood.value} 
									isActive={activeTab === mood.value} 
									onClick={() => setActiveTab(mood.value)} 
								/>
							))}
						</div>
						
						{/* Content Area */}
						<div className="mt-6">
							{activeTab === "all" ? (
								<div className="space-y-12">
									{availableMoods.map((mood) => {
										const MoodIcon = MOOD_ICONS[mood.value] || Music;
										return (
											<div key={mood.value} className="bg-zinc-800/30 p-4 rounded-lg">
												<div className="flex items-center gap-3 mb-4">
													<MoodIcon className="h-6 w-6" />
													<h3 className="text-xl font-bold">{getMoodLabel(mood.value)}</h3>
												</div>
												<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
													{(moodSongs[mood.value] || []).map(song => (
														<SongCard key={song._id} song={normalizeSongForCard(song)} />
													))}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="bg-zinc-800/30 p-4 rounded-lg">
									<div className="flex items-center gap-3 mb-6">
										{(() => {
											const ActiveMoodIcon = MOOD_ICONS[activeTab] || Music;
											return <ActiveMoodIcon className="h-6 w-6" />;
										})()}
										<h3 className="text-xl font-bold">{getMoodLabel(activeTab)}</h3>
									</div>
									
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
										{(moodSongs[activeTab] || []).map(song => (
											<SongCard key={song._id} song={normalizeSongForCard(song)} />
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};
export default Home;