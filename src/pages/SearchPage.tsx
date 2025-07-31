import React, { useState } from "react";
import AudixTopbar from "@/components/AudixTopbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SongCard from "@/components/SongCard";
import { Search, Music, Mic, Radio, User } from "lucide-react";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock search results
  const searchResults = [
    {
      _id: "1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=BL",
      duration: 200
    },
    {
      _id: "2",
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=WS",
      duration: 174
    },
    {
      _id: "3",
      title: "Levitating",
      artist: "Dua Lipa",
      imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=LV",
      duration: 203
    },
    {
      _id: "4",
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      imageUrl: "https://via.placeholder.com/200x200/1db954/ffffff?text=G4U",
      duration: 178
    }
  ];

  const categories = [
    { id: "all", label: "All", icon: Search },
    { id: "songs", label: "Songs", icon: Music },
    { id: "artists", label: "Artists", icon: Mic },
    { id: "albums", label: "Albums", icon: Radio },
    { id: "playlists", label: "Playlists", icon: User }
  ];

  const browseCategories = [
    {
      id: "pop",
      title: "Pop",
      color: "from-pink-500 to-rose-600",
      image: "https://via.placeholder.com/200x200/ec4899/ffffff?text=POP"
    },
    {
      id: "rock",
      title: "Rock",
      color: "from-red-500 to-orange-600",
      image: "https://via.placeholder.com/200x200/ef4444/ffffff?text=ROCK"
    },
    {
      id: "hiphop",
      title: "Hip Hop",
      color: "from-purple-500 to-violet-600",
      image: "https://via.placeholder.com/200x200/8b5cf6/ffffff?text=HIP+HOP"
    },
    {
      id: "electronic",
      title: "Electronic",
      color: "from-blue-500 to-cyan-600",
      image: "https://via.placeholder.com/200x200/3b82f6/ffffff?text=EDM"
    },
    {
      id: "jazz",
      title: "Jazz",
      color: "from-amber-500 to-yellow-600",
      image: "https://via.placeholder.com/200x200/f59e0b/ffffff?text=JAZZ"
    },
    {
      id: "classical",
      title: "Classical",
      color: "from-emerald-500 to-green-600",
      image: "https://via.placeholder.com/200x200/10b981/ffffff?text=CLASSICAL"
    }
  ];

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          {/* Search Input */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
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

              {/* Search Results */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Search results for "{searchQuery}"
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map(song => (
                    <SongCard key={song._id} song={song} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Browse All */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Browse all</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {browseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <h3 className="text-white font-bold text-lg">{category.title}</h3>
                        <div className="self-end">
                          <div className="w-16 h-16 bg-black/20 rounded-lg transform rotate-12 group-hover:rotate-6 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Searched */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Recently searched</h2>
                <div className="space-y-2">
                  {["The Weeknd", "Dua Lipa", "Harry Styles"].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                        <Search className="h-5 w-5 text-zinc-400" />
                      </div>
                      <span className="text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Popular searches</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.slice(0, 5).map(song => (
                    <SongCard key={song._id} song={song} />
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