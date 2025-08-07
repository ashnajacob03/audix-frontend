import { useState } from "react";

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
    setImageError(true);
    if (onError) {
      onError();
    }
  };

  return (
    <img
      src={imageError ? getFallbackImage(fallbackSeed) : src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default FallbackImage;