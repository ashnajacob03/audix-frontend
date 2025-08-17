import { useState, useEffect } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSeed?: string | number;
  onError?: () => void;
}

const FallbackImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSeed = "default",
  onError 
}: FallbackImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setCurrentSrc(src);
  }, [src]);

  // Array of high-quality music-themed fallback images from Unsplash
  const fallbackImages = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center", // Vinyl records
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center", // Music studio
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop&crop=center", // Concert stage
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&crop=center", // Headphones
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center", // Music equipment
  ];

  // Select a consistent fallback image based on the seed
  const getFallbackImage = (seed: string | number) => {
    const index = typeof seed === 'string' 
      ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackImages.length
      : Number(seed) % fallbackImages.length;
    return fallbackImages[index] || fallbackImages[0];
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setCurrentSrc(getFallbackImage(fallbackSeed));
      setImageLoading(true); // Start loading the fallback image
    }
    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder - only show when actually loading */}
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800 animate-pulse rounded-md z-10" 
        />
      )}
      
      {/* Main image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-md shadow-lg ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300 ease-in-out`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default FallbackImage;