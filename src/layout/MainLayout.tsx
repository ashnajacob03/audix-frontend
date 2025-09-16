import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import AdOverlay from "@/components/AdOverlay";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { currentSong, isAdPlaying } = useAudioPlayer();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<ResizablePanelGroup direction='horizontal' className={`flex-1 flex h-full overflow-hidden p-2 ${currentSong ? 'pb-0' : ''}`}>
				{/* left sidebar */}
				<ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
					<LeftSidebar />
				</ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<Outlet />
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			{/* Only show playback controls when a song is playing */}
			{currentSong && (
				<div className="animate-in slide-in-from-bottom-2 duration-300">
					<PlaybackControls />
				</div>
			)}
			{isAdPlaying && <AdOverlay seconds={10} />}
		</div>
	);
};
export default MainLayout;