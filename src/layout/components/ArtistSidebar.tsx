import { Link, useLocation } from "react-router-dom";
import { Music2, BarChart3, Users, Globe2, Wallet2, Megaphone, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-md text-sm transition border border-transparent",
        active
          ? "bg-zinc-900 text-white border-zinc-800"
          : "text-zinc-300 hover:text-white hover:bg-zinc-900/60"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
};

const ArtistSidebar = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-zinc-800">
        <div className="relative">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-fuchsia-600 to-purple-700" />
        </div>
        <div>
          <p className="text-sm text-zinc-300">Music Dashboard</p>
          <p className="text-white font-semibold">Artist Hub</p>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        <NavItem to="/artist" icon={BarChart3} label="Overview" />
        <NavItem to="/artist/music" icon={Music2} label="Music" />
        <NavItem to="/artist/analytics" icon={BarChart3} label="Analytics" />
        <NavItem to="/artist/audience" icon={Users} label="Audience" />
        <NavItem to="/artist/revenue" icon={Wallet2} label="Revenue" />
        <NavItem to="/artist/marketing" icon={Megaphone} label="Marketing" />
        <NavItem to="/artist/fans" icon={MessageSquare} label="Fans" />
        <NavItem to="/artist/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="mt-auto p-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3 h-3" />
          <span>Audix</span>
        </div>
      </div>
    </div>
  );
};

export default ArtistSidebar;



