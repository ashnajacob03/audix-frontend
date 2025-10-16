import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AudixTopbar from "@/components/AudixTopbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongCard from "@/components/SongCard";
import { Search, Music, Mic, Radio, User, Loader2, X } from "lucide-react";
import apiService from "@/services/api";

interface SearchResult {
  _id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  duration?: number;
  album?: string;
  popularity?: number;
  previewUrl?: string;
}

interface SearchResults {
  songs?: SearchResult[];
  artists?: any[];
  albums?: any[];
  playlists?: any[];
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus on search input when component mounts or when navigating to search page
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [location.pathname]); // Focus whenever the pathname changes (including repeated navigation to /search)

  // Focus when topbar search is clicked again on the search page
  useEffect(() => {
    const handler = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener('focus-search', handler as EventListener);
    return () => window.removeEventListener('focus-search', handler as EventListener);
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Remove individual search history item
  const removeSearchHistory = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the search click
    const updated = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Perform search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({});
      return;
    }

    setIsLoading(true);
    try {
      const results = await apiService.searchMusic(query, activeCategory, 20, 'all');
      setSearchResults(results);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({});
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults({});
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeCategory]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const categories = [
    { id: "all", label: "All", icon: Search },
    { id: "song", label: "Songs", icon: Music },
    { id: "artist", label: "Artists", icon: Mic },
    { id: "album", label: "Albums", icon: Radio },
    { id: "playlist", label: "Playlists", icon: User }
  ];


  return (
    <main className="flex-1 bg-zinc-900 text-white">
      <AudixTopbar />
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Search</h1>
            <p className="text-zinc-400">Discover millions of songs, artists, and albums</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 text-white placeholder-zinc-400 rounded-full py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-zinc-700 transition-all duration-200"
              />
            </form>
          </div>

          {searchQuery ? (
            <>
              {/* Search Categories */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        activeCategory === category.id
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  <span className="ml-3 text-zinc-400">Searching...</span>
                </div>
              )}

              {/* Search Results */}
              {!isLoading && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Search results for "{searchQuery}"
                  </h2>
                  
                  {/* Songs Results */}
                  {searchResults.songs && searchResults.songs.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Songs</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {searchResults.songs.map(song => (
                          <SongCard key={song._id} song={song} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artists Results */}
                  {searchResults.artists && searchResults.artists.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Artists</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {searchResults.artists.map(artist => {
                          const img = artist?.latestSong?.imageUrl;
                          return (
                            <div key={artist._id} className="bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg p-4 transition-all duration-300">
                              <div className="w-full aspect-square rounded-md mb-4 overflow-hidden bg-zinc-700 flex items-center justify-center">
                                {img ? (
                                  <img src={img} alt={artist._id} className="w-full h-full object-cover" />
                                ) : (
                                  <Mic className="h-12 w-12 text-zinc-400" />
                                )}
                              </div>
                              <h4 className="font-semibold text-white truncate">{artist._id}</h4>
                              <p className="text-sm text-zinc-400">{artist.songCount} songs</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Albums Results */}
                  {searchResults.albums && searchResults.albums.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Albums</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {searchResults.albums.map(album => {
                          const img = album?.latestSong?.imageUrl;
                          return (
                            <div key={album._id} className="bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg p-4 transition-all duration-300">
                              <div className="w-full aspect-square rounded-md mb-4 overflow-hidden bg-zinc-700 flex items-center justify-center">
                                {img ? (
                                  <img src={img} alt={album._id} className="w-full h-full object-cover" />
                                ) : (
                                  <Radio className="h-12 w-12 text-zinc-400" />
                                )}
                              </div>
                              <h4 className="font-semibold text-white truncate">{album._id}</h4>
                              <p className="text-sm text-zinc-400">{album.artist}</p>
                              <p className="text-sm text-zinc-400">{album.songCount} songs</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {(!searchResults.songs || searchResults.songs.length === 0) &&
                   (!searchResults.artists || searchResults.artists.length === 0) &&
                   (!searchResults.albums || searchResults.albums.length === 0) && (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-zinc-400 mb-2">No results found</h3>
                      <p className="text-zinc-500">Try adjusting your search terms or browse categories below</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>

              {/* Recently Searched */}
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-4">Recently searched</h2>
                  <div className="space-y-2">
                    {recentSearches.map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-all duration-200"
                      >
                        <div 
                          onClick={() => handleRecentSearchClick(item)}
                          className="flex items-center gap-3 flex-1"
                        >
                          <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                            <Search className="h-5 w-5 text-zinc-400" />
                          </div>
                          <span className="text-white">{item}</span>
                        </div>
                        <button
                          onClick={(e) => removeSearchHistory(index, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-zinc-700/50 transition-all duration-200 flex items-center justify-center"
                          aria-label="Remove search history"
                        >
                          <X className="h-4 w-4 text-zinc-400 hover:text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Popular searches</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    { title: "The Weeknd", artist: "Blinding Lights" },
                    { title: "Dua Lipa", artist: "Levitating" },
                    { title: "Harry Styles", artist: "Watermelon Sugar" },
                    { title: "Olivia Rodrigo", artist: "Good 4 U" },
                    { title: "Ed Sheeran", artist: "Shape of You" }
                  ].map((song, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(song.title);
                        performSearch(song.title);
                      }}
                      className="bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg p-4 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 flex items-center justify-center">
                        <Music className="h-12 w-12 text-zinc-400" />
                      </div>
                      <h3 className="font-semibold text-white truncate">{song.title}</h3>
                      <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default SearchPage;