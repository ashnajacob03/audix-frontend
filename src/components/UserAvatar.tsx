import React from 'react';
import { processGoogleProfileImage } from '../utils/imageUtils';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineStatus?: boolean;
  src?: string;
  className?: string;
  firstName?: string;
  lastName?: string;
}

const getUserInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '?';
  
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  
  return first + last;
};

const sizeMap = {
  sm: 'size-6',
  md: 'size-10',
  lg: 'size-14',
  xl: 'size-20',
  '2xl': 'size-28',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 'md', showOnlineStatus = false, src, className = '', firstName, lastName }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);
  
  // Process the image URL (especially for Google profile images)
  const processedSrc = React.useMemo(() => {
    return processGoogleProfileImage(src);
  }, [src]);

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [processedSrc]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Show fallback immediately if no src provided
  if (!processedSrc) {
    return (
      <div className={`relative inline-block ${sizeMap[size]} ${className}`}>
        <div className={`rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center text-white font-semibold text-sm w-full h-full`}>
          {getUserInitials(firstName, lastName)}
        </div>
        {showOnlineStatus && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${sizeMap[size]} ${className}`}>
      {/* Loading placeholder - only show when actually loading */}
      {imageLoading && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 animate-pulse z-10" />
      )}
      
      {/* Main image */}
      {processedSrc && !imageError && (
        <img
          src={processedSrc}
          alt="Profile"
          className={`rounded-full object-cover w-full h-full ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300 ease-in-out`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      )}
      
      {/* Fallback - always present but only show when image fails or is loading */}
      <div className={`rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center text-white font-semibold text-sm w-full h-full absolute inset-0 ${
        (imageError || imageLoading) ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300 ease-in-out`}>
        {getUserInitials(firstName, lastName)}
      </div>
      
      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
};

export default UserAvatar;
