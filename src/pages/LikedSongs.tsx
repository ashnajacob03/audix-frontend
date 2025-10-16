import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useCustomAuth } from '@/contexts/AuthContext';
import FallbackImage from '@/components/FallbackImage';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause } from 'lucide-react';

interface LikedSongItem {
	_id: string;
	title: string;
	artist?: string;
	imageUrl?: string;
	previewUrl?: string;
	duration?: number;
}

const LikedSongs = () => {
	const { playSong, playQueue, currentSong, isPlaying, pause, resume } = useAudioPlayer();
  const { isAuthenticated } = useCustomAuth();
	const [songs, setSongs] = useState<LikedSongItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			if (!api.isAuthenticated() || !isAuthenticated) {
				setError('Please log in to view your liked songs.');
				setSongs([]);
				return;
			}
			const data = await api.getLikedSongs({ suppressAuthRedirect: true } as any);
			if (data && (data as any).error) {
				setError('Authentication required. Please log in again.');
				setSongs([]);
				return;
			}
			setSongs(Array.isArray(data) ? data : []);
		} catch (e: any) {
			setError(e?.message || 'Failed to load liked songs');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void load();
	}, []);

	const handleToggleLike = async (songId: string) => {
		setBusyId(songId);
		try {
			const resp = await api.likeSong(songId, { suppressAuthRedirect: true } as any);
			const isLiked = !!resp?.isLiked;
			if (!isLiked) {
				setSongs((prev) => prev.filter((s) => s._id !== songId));
			}
		} catch {
			// ignore
		} finally {
			setBusyId(null);
		}
	};

	const handlePlayPause = (song: LikedSongItem) => {
		if (currentSong?._id === song._id) {
			if (isPlaying) pause(); else resume();
			return;
		}
		// Find the index of the clicked song in the liked songs list
		const songIndex = songs.findIndex(s => s._id === song._id);
		if (songIndex !== -1) {
			// Play the entire liked songs queue starting from the clicked song
			playQueue(songs as any, songIndex, 'liked');
		} else {
			// Fallback to single song play if not found in list
			playSong(song as any);
		}
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<AudixTopbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className="p-4 sm:p-6">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-white">Liked Songs</h1>
						<p className="text-zinc-400 mt-2">Your liked songs will appear here.</p>
					</div>

					{loading ? (
						<div className="text-zinc-400">Loading…</div>
					) : error ? (
						<div className="text-red-400">{error}</div>
					) : songs.length === 0 ? (
						<div className="text-zinc-400">No liked songs yet.</div>
					) : (
						<div className="space-y-2">
							{songs.map((song) => {
								const isThisSong = currentSong?._id === song._id;
								return (
									<div key={song._id} className="flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50">
										<div className="w-12 h-12">
											<FallbackImage
												src={song.imageUrl || ''}
												alt={song.title}
												className="w-12 h-12 rounded"
												fallbackSeed={song._id}
											/>
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-white truncate">{song.title}</div>
											<div className="text-sm text-zinc-400 truncate">{song.artist}</div>
										</div>
										<div className="flex items-center gap-2">
											<Button size="icon" className="h-8 w-8" onClick={() => handlePlayPause(song)}>
												{isThisSong && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className={`h-8 w-8 ${busyId === song._id ? 'opacity-70' : ''}`}
												onClick={() => handleToggleLike(song._id)}
												disabled={busyId === song._id}
												aria-label="Unlike"
											>
												<Heart className="h-4 w-4 text-red-500 fill-red-500" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default LikedSongs;


