/**
 * Utility functions for handling images, especially Google profile images
 */

// Cache for processed image URLs to prevent unnecessary re-processing
const processedImageCache = new Map<string, string>();

/**
 * Process Google profile image URL to ensure it works properly
 * Google sometimes provides URLs that need modification for better compatibility
 */
export const processGoogleProfileImage = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Check cache first
  if (processedImageCache.has(imageUrl)) {
    return processedImageCache.get(imageUrl)!;
  }
  
  try {
    let processedUrl: string;
    
    // If it's a Google profile image URL, ensure it has proper size parameter
    if (imageUrl.includes('googleusercontent.com')) {
      // Remove existing size parameters and add our own
      const baseUrl = imageUrl.split('=')[0];
      processedUrl = `${baseUrl}=s400-c`; // s400 = 400px, c = crop to square
    } else {
      // For other URLs, return as-is
      processedUrl = imageUrl;
    }
    
    // Cache the result
    processedImageCache.set(imageUrl, processedUrl);
    return processedUrl;
  } catch (error) {
    console.error('Error processing image URL:', error);
    // Cache the original URL to prevent repeated processing attempts
    processedImageCache.set(imageUrl, imageUrl);
    return imageUrl;
  }
};

/**
 * Clear the image processing cache (useful for testing or memory management)
 */
export const clearImageCache = (): void => {
  processedImageCache.clear();
};

/**
 * Check if an image URL is accessible
 */
export const checkImageAccessibility = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Get a fallback image URL based on user initials
 */
export const generateInitialsImage = (firstName?: string, lastName?: string): string => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  
  // Use a service like UI Avatars to generate an image with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1db954&color=ffffff&size=400&font-size=0.33`;
};

export default {
  processGoogleProfileImage,
  checkImageAccessibility,
  generateInitialsImage,
  clearImageCache,
};