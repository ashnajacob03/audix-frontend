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