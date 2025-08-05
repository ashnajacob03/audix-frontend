import { User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCustomAuth } from '@/contexts/AuthContext';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showOnlineStatus?: boolean;
  fallbackIcon?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  className = '',
  showOnlineStatus = false,
  fallbackIcon = true
}) => {
  const { userProfile } = useUserProfile();
  const { user: customUser } = useCustomAuth();

  // Get profile image from multiple sources (priority order)
  const getProfileImage = () => {
    // 1. Check localStorage for uploaded profile image
    const uploadedImage = localStorage.getItem('userProfileImage');
    if (uploadedImage) return uploadedImage;
    
    // 2. Check custom user from MongoDB
    if (customUser?.picture) return customUser.picture;
    
    // 3. Check userProfile from MongoDB
    if (userProfile?.profilePicture) return userProfile.profilePicture;

    // 4. No image available
    return null;
  };

  // Get user initials for fallback
  const getUserInitials = () => {
    const firstName = customUser?.firstName || userProfile?.firstName || '';
    const lastName = customUser?.lastName || userProfile?.lastName || '';

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (customUser?.email) {
      return customUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Size configurations
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    '2xl': 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  const profileImage = getProfileImage();
  const initials = getUserInitials();

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-green-500/20 transition-all duration-200 hover:ring-green-500/40`}>
        {profileImage ? (
          <img 
            src={profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it and show fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : fallbackIcon ? (
          <User className={`${iconSizes[size]} text-white`} />
        ) : (
          <span className={`${textSizes[size]} font-bold text-white`}>
            {initials}
          </span>
        )}
      </div>
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default UserAvatar;
