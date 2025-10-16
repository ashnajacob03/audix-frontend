export interface NavItem {
    icon?: string;
    label: string;
    active?: boolean;
  }
  
  export interface Playlist {
  id: string;
  title: string;
  description: string;
  author: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  profilePicture?: string;
  isArtist?: boolean;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  duration?: number;
  previewUrl?: string;
  spotifyId?: string;
  album?: string;
  popularity?: number;
  releaseYear?: number;
}

export interface AnalyticsData {
  users: {
    new: number;
    active: number;
    premium: number;
    newGrowthRate?: number;
    activeGrowthRate?: number;
    premiumGrowthRate?: number;
    total?: number;
    totalGrowthRate?: number;
  };
  conversations: {
    conversations: number;
    messages: number;
    messagesGrowthRate?: number;
  };
  revenue?: {
    total: number;
    monthly: number;
  };
  streams?: {
    total: number;
    monthly: number;
  };
  engagement?: {
    likes: number;
    shares: number;
  };
}

export interface SearchResult {
  _id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  type: 'song' | 'artist' | 'playlist';
}