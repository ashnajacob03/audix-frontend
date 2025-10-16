import { useCustomAuth } from "@/contexts/AuthContext";
import { 
  Crown, 
  Shield, 
  LogOut, 
  ChevronDown,
  Home
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLogout } from "@/hooks/useLogout";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Use a fixed URL for the admin profile image (replace with your own)
const ADMIN_IMAGE_URL = '"C:/Users/ashna/OneDrive/Desktop/WhatsApp Image 2025-06-19 at 11.59.05_2f00120d.jpg"';

const AdminTopbar = () => {
  const { user } = useCustomAuth();
  const { userProfile } = useUserProfile();
  const { logout } = useLogout();

  const handleBackToApp = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await fetch('http://localhost:3002/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch {}
    finally {
      // Clear client auth state and redirect to public landing
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('mongoUser');
      window.location.href = '/';
    }
  };

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
              Welcome Ashna
              <Crown className="w-5 h-5 text-yellow-500" />
            </h1>
            <p className="text-xs text-zinc-400">System Administration</p>
          </div>
        </div>
      </div>

      {/* Center - Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackToApp}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-zinc-300 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to App
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
              <UserAvatar
                size="md"
                showOnlineStatus={true}
                className="ring-red-500/20 hover:ring-red-500/40"
                src={ADMIN_IMAGE_URL || userProfile?.profilePicture || user?.picture}
                firstName={userProfile?.firstName || user?.firstName}
                lastName={userProfile?.lastName || user?.lastName}
              />
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-700">
            <div className="px-3 py-2 border-b border-zinc-700">
              <p className="text-sm font-medium text-white">
                {userProfile?.firstName || user?.firstName || 'Admin'}
              </p>
              <p className="text-xs text-zinc-400">
                {userProfile?.email || user?.email}
              </p>
              <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                <Crown className="w-3 h-3" />
                Administrator
              </p>
            </div>
            
            
            <DropdownMenuItem asChild>
              <button
                onClick={handleBackToApp}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer w-full text-left"
              >
                <Home className="w-4 h-4" />
                Back to App
              </button>
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
