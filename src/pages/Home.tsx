import { useEffect, useMemo, useState } from "react";
import AudixTopbar from "@/components/AudixTopbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongCard from "@/components/SongCard";
import apiService from "@/services/api";

import { 
	Loader2
} from "lucide-react";

// Mood mappings removed as they were unused

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
	artist: song?.artist || 'Unknown Artist', // Ensure artist name is never undefined
});

const Home = () => {
	// const [activeTab, setActiveTab] = useState("all"); // unused
	const [featuredSongs, setFeaturedSongs] = useState<SongItem[]>([]);
	const [featuredPool, setFeaturedPool] = useState<SongItem[]>([]);
	// const [madeForYouSongs, setMadeForYouSongs] = useState<SongItem[]>([]); // unused
	const [trendingSongs, setTrendingSongs] = useState<SongItem[]>([]);
	const [trendingPool, setTrendingPool] = useState<SongItem[]>([]);
	const [randomSongs, setRandomSongs] = useState<SongItem[]>([]);
	const [popularPool, setPopularPool] = useState<SongItem[]>([]);
	// const [moodSongs, setMoodSongs] = useState<Record<string, SongItem[]>>({}); // unused
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showAllFeatured, setShowAllFeatured] = useState(false);
	const [showAllTrending, setShowAllTrending] = useState(false);

	const recentSearches = useMemo<string[]>(() => {
		try {
			const saved = localStorage.getItem('recentSearches');
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	}, []);

	const featuredMessage = useMemo(() => {
		if (randomSongs.length > 0) {
			return 'Fresh random picks for you.';
		}
		if (!recentSearches || recentSearches.length === 0) {
			return 'Handpicked tracks to get you started.';
		}
		const freq: Record<string, number> = {};
		recentSearches.forEach(q => {
			const key = (q || '').trim().toLowerCase();
			if (!key) return;
			freq[key] = (freq[key] || 0) + 1;
		});
		const top = Object.entries(freq)
			.sort((a,b) => b[1]-a[1])
			.map(([q]) => q)
			.slice(0, 2)
			.map(s => s.replace(/\b\w/g, c => c.toUpperCase()))
			.join(', ');
		return top ? `Inspired by your searches: ${top}` : 'Handpicked tracks to get you started.';
	}, [recentSearches, randomSongs.length]);

	useEffect(() => {
		let isMounted = true;
		const loadHomeData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const q1 = recentSearches[0];
				const q2 = recentSearches[1];
				const [featRes, madeRes, popularRes] = await Promise.all([
					q1 ? apiService.searchMusic(q1, 'song', 10, 'local') : apiService.getPopularSongs(10),
					q2 ? apiService.searchMusic(q2, 'song', 10, 'local') : apiService.getPopularSongs(10),
					apiService.getPopularSongs(50)
				]);

				const featFull = (featRes?.songs || featRes || []) as SongItem[];
				const featSongs = featFull.slice(0, 5);
				const madeSongs = (madeRes?.songs || madeRes || []).slice(0, 10);

				// Trending based on most frequently searched queries
				const freqMap: Record<string, number> = {};
				recentSearches.forEach(q => {
					const key = (q || '').trim().toLowerCase();
					if (!key) return;
					freqMap[key] = (freqMap[key] || 0) + 1;
				});
				const topQueries = Object.entries(freqMap)
					.sort((a,b) => b[1]-a[1])
					.map(([q]) => q)
					.slice(0, 3);
				const trendResults = await Promise.all(
					(topQueries.length ? topQueries : recentSearches.slice(0,3)).map(q => 
						apiService.searchMusic(q, 'song', 10, 'local')
					)
				);
				const trendFull = trendResults
					.flatMap(r => (r?.songs || r || []) as SongItem[]);
				const trendSongs = trendFull.slice(0, 10);

				// Random picks from a larger pool (shuffle then slice)
				const pool = (popularRes?.songs || popularRes || []) as SongItem[];
				const shuffled = [...pool].sort(() => Math.random() - 0.5);
				const random = shuffled.slice(0, 10);

				if (!isMounted) return;
				setFeaturedPool(featFull);
				setFeaturedSongs(featSongs as SongItem[]);
				// setMadeForYouSongs(madeSongs as SongItem[]); // unused
				setTrendingPool(trendFull);
				setTrendingSongs(trendSongs as SongItem[]);
				setPopularPool(pool);
				setRandomSongs(random as SongItem[]);
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
				// Process moods in batches to avoid overwhelming the server
				const batchSize = 3;
				for (let i = 0; i < availableMoods.length; i += batchSize) {
					const batch = availableMoods.slice(i, i + batchSize);
					const batchPromises = batch.map(async (m) => {
						const genre = MOOD_GENRE_MAP[m.value] || m.value;
						try {
							const list = await apiService.getSongsByGenre(genre, 3);
							return { mood: m.value, songs: (list?.songs || list || []) as SongItem[] };
						} catch (error) {
							console.warn(`Failed to fetch songs for mood ${m.value}:`, error);
							return { mood: m.value, songs: [] };
						}
					});
					const batchResults = await Promise.all(batchPromises);
					batchResults.forEach(({ mood, songs }) => {
						map[mood] = songs;
					});
					if (i + batchSize < availableMoods.length) {
						await new Promise((r) => setTimeout(r, 300));
					}
				}
				if (!isMounted) return;
				// setMoodSongs(map); // unused
			} catch (error) {
				console.error('Error fetching mood songs:', error);
			}
		};
		fetchMoods();
		return () => { isMounted = false; };
	}, []);

	// Function to get user-friendly mood name - unused
	// const getMoodLabel = (mood: string) => {
	//	const foundMood = availableMoods.find(m => m.value === mood);
	//	return foundMood ? foundMood.label : mood.charAt(0).toUpperCase() + mood.slice(1).replace('_', ' ');
	// };

	// NOTE: MoodCard is kept for future sections; not used in this simplified layout

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<AudixTopbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
	        <div className="p-4 sm:p-6">

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
						<div className="flex items-center justify-between mb-1">
							<h2 className="text-xl font-bold">Featured</h2>
							<span
								className="text-sm text-zinc-400 hover:text-white cursor-pointer"
								onClick={() => setShowAllFeatured(v => !v)}
							>
								{showAllFeatured ? 'Show less' : 'Show all'}
							</span>
						</div>
						<p className="text-sm text-zinc-400 mb-3">{featuredMessage}</p>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{(
								(() => {
									const base = randomSongs.length ? (showAllFeatured ? popularPool : randomSongs) : (showAllFeatured ? featuredPool : featuredSongs);
									return base;
								})()
							).map(song => (
								<SongCard key={song._id} song={normalizeSongForCard(song)} />
							))}
						</div>
					</div>

					{/* Main music sections */}
					<div className='space-y-8'>
						{/* Trending */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">Trending for You</h2>
								<span
									className="text-sm text-zinc-400 hover:text-white cursor-pointer"
									onClick={() => setShowAllTrending(v => !v)}
								>
									{showAllTrending ? 'Show less' : 'Show all'}
								</span>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{(showAllTrending ? trendingPool : trendingSongs).map(song => (
									<SongCard key={song._id} song={normalizeSongForCard(song)} />
								))}
							</div>
						</div>
					</div>
						
					</div>
			</ScrollArea>
		</main>
	);
};
export default Home;