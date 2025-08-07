import React from 'react';
import { processGoogleProfileImage } from '@/utils/imageUtils';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnlineStatus?: boolean;
  src?: string;
  className?: string;
  firstName?: string;
  lastName?: string;
}

const getUserInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return '?';
  if (firstName && lastName) return firstName[0] + lastName[0];
  return (firstName || lastName || '?')[0];
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
  
  // Process the image URL (especially for Google profile images)
  const processedSrc = React.useMemo(() => {
    return processGoogleProfileImage(src);
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    // Image loaded successfully
  };

  return (
    <div className={`relative inline-block ${sizeMap[size]} ${className}`}>
      {processedSrc && !imageError ? (
        <img
          src={processedSrc}
          alt="Profile"
          className={`rounded-full object-cover w-full h-full`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className={`rounded-full bg-gradient-to-br from-[#1db954] to-[#1ed760] flex items-center justify-center text-white font-semibold text-sm w-full h-full`}>
          {getUserInitials(firstName, lastName)}
        </div>
      )}
      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
};

export default UserAvatar;
