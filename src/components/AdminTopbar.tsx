import { useCustomAuth } from "@/contexts/AuthContext";
import { 
  Crown, 
  Shield, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Home,
  Bell,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLogout } from "@/hooks/useLogout";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const AdminTopbar = () => {
  const { user } = useCustomAuth();
  const { userProfile } = useUserProfile();
  const { logout } = useLogout();

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-700/50 sticky top-0 z-50">
      {/* Left side - Admin branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Admin Panel
              <Crown className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-xs text-zinc-400">System Administration</p>
          </div>
        </div>
      </div>

      {/* Center - Navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-zinc-300 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to App
        </Link>
        
        <button className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-zinc-300 hover:text-white hover:bg-zinc-800"
        )}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </button>
        
        <button className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "text-zinc-300 hover:text-white hover:bg-zinc-800 relative"
        )}>
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </button>
      </div>

      {/* Right side - Admin profile */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-white">
            {userProfile?.firstName || user?.firstName || 'Admin'}
          </p>
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Administrator
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
              <UserAvatar size="md" showOnlineStatus={true} className="ring-red-500/20 hover:ring-red-500/40" />
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-700">
            <div className="px-3 py-2 border-b border-zinc-700">
              <p className="text-sm font-medium text-white">
                {userProfile?.firstName || user?.firstName || 'Admin'}
              </p>
              <p className="text-xs text-zinc-400">
                {userProfile?.email || user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                <Crown className="w-3 h-3" />
                Administrator
              </p>
            </div>
            
            <DropdownMenuItem asChild>
              <Link 
                to="/profile" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Admin Profile
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                <Settings className="w-4 h-4" />
                Admin Settings
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-zinc-700" />
            
            <DropdownMenuItem asChild>
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Back to App
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AdminTopbar;
