import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import AdOverlay from "@/components/AdOverlay";
import { ChevronRight, ChevronLeft } from "lucide-react";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { currentSong, isAdPlaying, currentAd } = useAudioPlayer();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);
    const leftPanelRef = useRef<ImperativePanelHandle | null>(null);
    const rightPanelRef = useRef<ImperativePanelHandle | null>(null);

    return (
        <div className='h-screen bg-black text-white flex flex-col relative'>
            <ResizablePanelGroup direction='horizontal' className={`flex-1 flex h-full overflow-hidden p-2 ${currentSong ? 'pb-0' : ''}`}>
                {/* left sidebar */}
                <ResizablePanel
                    ref={leftPanelRef as any}
                    defaultSize={20}
                    minSize={isMobile ? 0 : 10}
                    maxSize={30}
                    collapsedSize={0}
                    collapsible
                    onCollapse={() => setLeftCollapsed(true)}
                    onExpand={() => setLeftCollapsed(false)}
                >
                    <LeftSidebar onCollapse={() => { setLeftCollapsed(true); leftPanelRef.current?.collapse(); }} />
                </ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

                {/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<div className="h-full overflow-auto relative">
						<Outlet />
					</div>
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

                        {/* right sidebar */}
                        <ResizablePanel
                            ref={rightPanelRef as any}
                            defaultSize={20}
                            minSize={0}
                            maxSize={25}
                            collapsedSize={0}
                            collapsible
                            onCollapse={() => setRightCollapsed(true)}
                            onExpand={() => setRightCollapsed(false)}
                        >
                            <FriendsActivity onCollapse={() => { setRightCollapsed(true); rightPanelRef.current?.collapse(); }} />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

            {/* Expand buttons when collapsed */}
            {leftCollapsed && (
                <button
                    onClick={() => { leftPanelRef.current?.expand(); setLeftCollapsed(false); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-full p-2 shadow"
                    aria-label="Expand left sidebar"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
            {!isMobile && rightCollapsed && (
                <button
                    onClick={() => { rightPanelRef.current?.expand(); setRightCollapsed(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-full p-2 shadow"
                    aria-label="Expand right sidebar"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

			{/* Only show playback controls when a song is playing */}
			{currentSong && (
				<div className="animate-in slide-in-from-bottom-2 duration-300">
					<PlaybackControls />
				</div>
			)}
			{isAdPlaying && <AdOverlay seconds={currentAd?.duration || 10} ad={currentAd} />}
		</div>
	);
};
export default MainLayout;