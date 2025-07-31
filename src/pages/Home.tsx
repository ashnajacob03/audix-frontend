import React, { useState } from "react";
import AudixTopbar from "@/components/AudixTopbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongCard from "@/components/SongCard";

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
	Clock,
	ArrowRight
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

// Mock data
const featuredSongs = [
	{
		_id: "1",
		title: "Blinding Lights",
		artist: "The Weeknd",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=BL",
		duration: 200
	},
	{
		_id: "2",
		title: "Watermelon Sugar",
		artist: "Harry Styles",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=WS",
		duration: 174
	},
	{
		_id: "3",
		title: "Levitating",
		artist: "Dua Lipa",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=LV",
		duration: 203
	},
	{
		_id: "4",
		title: "Good 4 U",
		artist: "Olivia Rodrigo",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=G4U",
		duration: 178
	},
	{
		_id: "5",
		title: "Stay",
		artist: "The Kid LAROI, Justin Bieber",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=ST",
		duration: 141
	}
];

const madeForYouSongs = [
	{
		_id: "6",
		title: "Heat Waves",
		artist: "Glass Animals",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=HW",
		duration: 238
	},
	{
		_id: "7",
		title: "Industry Baby",
		artist: "Lil Nas X, Jack Harlow",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=IB",
		duration: 212
	},
	{
		_id: "8",
		title: "Bad Habits",
		artist: "Ed Sheeran",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=BH",
		duration: 231
	}
];

const trendingSongs = [
	{
		_id: "9",
		title: "As It Was",
		artist: "Harry Styles",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=AIW",
		duration: 167
	},
	{
		_id: "10",
		title: "About Damn Time",
		artist: "Lizzo",
		imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=ADT",
		duration: 191
	}
];

const availableMoods = [
	{ value: "happy", label: "Happy" },
	{ value: "sad", label: "Sad" },
	{ value: "energetic", label: "Energetic" },
	{ value: "relax", label: "Relax" },
	{ value: "party", label: "Party" }
];

const Home = () => {
	const [activeTab, setActiveTab] = useState("all");

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

					{/* Featured Section */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold">Featured</h2>
							<span className="text-sm text-zinc-400 hover:text-white cursor-pointer">
								Show all
							</span>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{featuredSongs.slice(0, 5).map(song => (
								<SongCard key={song._id} song={song} />
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
									<SongCard key={song._id} song={song} />
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
									<SongCard key={song._id} song={song} />
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
													{featuredSongs.slice(0, 3).map(song => (
														<SongCard key={song._id} song={song} />
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
										{featuredSongs.map(song => (
											<SongCard key={song._id} song={song} />
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