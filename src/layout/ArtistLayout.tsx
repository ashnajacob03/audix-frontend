import { Outlet } from "react-router-dom";
import ArtistSidebar from "./components/ArtistSidebar";

const ArtistLayout = () => {
  return (
    <div className="h-screen bg-black text-white grid grid-cols-[260px_1fr]">
      <aside className="h-full border-r border-zinc-800 bg-zinc-950">
        <ArtistSidebar />
      </aside>
      <main className="h-full overflow-auto">
        <div className="sticky top-0 z-10 bg-zinc-950/70 backdrop-blur border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/audix.png" className="w-6 h-6" />
            <span className="font-semibold">Artist Hub</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ArtistLayout;



