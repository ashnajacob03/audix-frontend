
import { Crown, Search, User, BarChart3, Heart, Music, ChevronDown, LogOut, Settings, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLogout } from "@/hooks/useLogout";
import { useCustomAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";
import NotificationDropdown from "./NotificationDropdown";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const AudixTopbar = () => {
  const { userProfile } = useUserProfile();
  const { logout } = useLogout();
  const { isAuthenticated, user: customUser, logout: customLogout } = useCustomAuth();
  const isPremium = (customUser?.accountType === 'premium') || (userProfile as any)?.accountType === 'premium';
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10
    "
    >
      <div className="flex gap-2 items-center">
        <img src="/audix.png" className="size-8" alt="Music logo" />
        Audix
      </div>
      <div className="flex items-center gap-4">
        {/* Search Button */}
        <Link
          to="/search"
          onClick={(e) => {
            if (location.pathname === "/search") {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("focus-search"));
            } else {
              // Ensure navigation if not already on /search
              e.preventDefault();
              navigate("/search");
            }
          }}
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "rounded-md flex items-center gap-2 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-zinc-600 transition-all"
          )}
          title="Search songs"
        >
          <Search className="size-4" />
          Search
        </Link>

        {/* Notification Dropdown - Only show when user is logged in */}
        {isAuthenticated && customUser && (
          <NotificationDropdown 
            userId={customUser.id} 
            authToken={localStorage.getItem('accessToken') || ''} 
          />
        )}

        {/* Show login button when user is not authenticated */}
        {!isAuthenticated && (
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "bg-[#1db954] hover:bg-[#1ed760] text-white"
            )}
          >
            Login
          </Link>
        )}

        {/* Premium upgrade button - Only show when user is logged in and not premium */}
        {isAuthenticated && !isPremium && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/premium"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-none hover:from-amber-600 hover:to-yellow-400"
                  )}
                >
                  <Crown className="mr-1 h-4 w-4" />
                  Upgrade
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upgrade to Premium</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* User dropdown - Only show when user is logged in */}
        {isAuthenticated && (
          <div className="flex items-center gap-1">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-800/50 transition-colors">
                <UserAvatar size="md" showOnlineStatus={true} src={customUser?.picture} firstName={customUser?.firstName} lastName={customUser?.lastName} />
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-700">
              <div className="px-3 py-2 border-b border-zinc-700">
                <p className="text-sm font-medium text-white">
                  {customUser?.firstName || userProfile?.firstName || 'User'}
                </p>
                <p className="text-xs text-zinc-400">
                  {customUser?.email || userProfile?.email}
                </p>
              </div>
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              
              
              <DropdownMenuItem asChild>
                <Link to="/liked" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                  <Heart className="w-4 h-4" />
                  Liked Songs
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/playlists" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                  <Music className="w-4 h-4" />
                  My Playlists
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-700" />
              
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              {isPremium && (
                <DropdownMenuItem asChild>
                  <Link to="/cancel-premium" className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 cursor-pointer">
                    <XCircle className="w-4 h-4" />
                    Cancel Premium
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    // Use custom logout for MongoDB users, fallback to Clerk logout
                    if (customUser) {
                      customLogout();
                    } else {
                      logout();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}
      </div>
    </div>
  );
};
export default AudixTopbar;