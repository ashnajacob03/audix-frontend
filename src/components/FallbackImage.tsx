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
    if (!src) {
      // If no source provided, immediately use fallback
      const offlineFallback = generateInlineFallback(fallbackSeed);
      setCurrentSrc(offlineFallback);
    } else {
      setCurrentSrc(src);
    }
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

  // Generate an inline SVG data URL as an offline-safe placeholder
  const generateInlineFallback = (seed: string | number) => {
    const bg = '#27272a';
    const fg = '#3f3f46';
    const hash = (typeof seed === 'string' ? seed : String(seed)).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hue = hash % 360;
    const grad = `linear-gradient(135deg, hsl(${hue},30%,30%), hsl(${(hue+40)%360},30%,20%))`;
    // Simple 1x1 SVG with gradient-like rectangle (approx via two rects)
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='hsl(${hue},30%,30%)' />
            <stop offset='100%' stop-color='hsl(${(hue+40)%360},30%,20%)' />
          </linearGradient>
        </defs>
        <rect width='400' height='400' fill='url(#g)' />
      </svg>`
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      const offlineSafe = navigator.onLine ? getFallbackImage(fallbackSeed) : generateInlineFallback(fallbackSeed);
      setCurrentSrc(offlineSafe);
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