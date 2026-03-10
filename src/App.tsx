import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Search, 
  Tv, 
  LayoutGrid, 
  List as ListIcon, 
  ChevronRight, 
  Info,
  MonitorPlay,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { Channel } from './types';
import { CHANNELS } from './channels';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [playlist] = useState<Channel[]>(CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ztv-favorites-v2');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      localStorage.setItem('ztv-favorites-v2', JSON.stringify(next));
      return next;
    });
  };

  const categories = useMemo(() => {
    const order = ['All', 'Favorites', 'Movies', 'Sports', 'Songs', 'cartoons', 'News', 'entertainments'];
    const cats = new Set(playlist.map(c => c.category));
    const availableCats = Array.from(cats);
    
    return order.filter(cat => {
      if (cat === 'All') return true;
      if (cat === 'Favorites') return favorites.length > 0;
      return availableCats.includes(cat);
    });
  }, [playlist, favorites]);

  const filteredChannels = useMemo(() => {
    return playlist.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Favorites'
          ? favorites.includes(channel.id)
          : channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [playlist, searchQuery, selectedCategory, favorites]);

  const isProtocolSupported = (url: string) => {
    const protocol = url.split(':')[0].toLowerCase();
    const supported = ['http', 'https'];
    return supported.includes(protocol);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setSelectedChannel(null)}
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Tv className="text-black" size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-emerald-500 transition-colors">Ztv</h1>
          </div>
        </div>

        {!selectedChannel && (
          <div className="flex-1 max-w-md mx-4 sm:mx-8 flex items-center transition-all duration-300">
            <div className="relative group w-full">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors z-10" 
                size={18} 
              />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {selectedChannel && (
            <button 
              onClick={() => setSelectedChannel(null)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all border border-emerald-500/20 text-xs font-bold uppercase tracking-widest mr-2"
            >
              <ArrowLeft size={14} />
              Home
            </button>
          )}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white/10 text-emerald-500 shadow-sm" : "text-white/40 hover:text-white"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white/10 text-emerald-500 shadow-sm" : "text-white/40 hover:text-white"
              )}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/5 px-6 py-4 sticky top-20 z-40 overflow-x-auto flex gap-3 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
              selectedCategory === cat 
                ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105" 
                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* Home Hero Title */}
        {!selectedChannel && (
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-white/5 p-4 md:p-6 mb-4 group">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full group-hover:bg-emerald-500/15 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/15 transition-colors duration-700" />
            
            <div className="relative z-10 space-y-2">
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Now
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-[0.8] drop-shadow-2xl">
                  Ztv
                </h2>
                <p className="text-white/50 text-xs md:text-sm max-w-xl leading-relaxed font-medium tracking-tight">
                  Your premium destination for high-quality <span className="text-white">live streaming</span> and entertainment.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="h-px w-12 bg-white/20" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Experience the Future</span>
              </div>
            </div>
          </div>
        )}

        {/* Player Section */}
        {selectedChannel && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <VideoPlayer src={selectedChannel.url} />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedChannel.logo} 
                      alt={selectedChannel.name}
                      className="w-12 h-12 rounded-xl object-cover bg-black ring-1 ring-white/10"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedChannel.name}/100/100`; }}
                    />
                    <div>
                      <h2 className="text-xl font-bold">{selectedChannel.name}</h2>
                    </div>
                  </div>
                </div>
                
                {!isProtocolSupported(selectedChannel.url) && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3 text-amber-200/80">
                    <Info size={16} className="mt-0.5 text-amber-500 shrink-0" />
                    <p className="text-[10px] leading-relaxed">
                      Protocol ({selectedChannel.url.split(':')[0]}) might require a specialized player or proxy for web playback.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Tv size={20} className="text-emerald-500" />
                More Channels
              </h3>
              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="Search channels..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Channel Grid/List */}
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
            : "grid-cols-1"
        )}>
          {filteredChannels.map(channel => (
            <div
              key={channel.id}
              onClick={() => handleChannelSelect(channel)}
              className={cn(
                "group relative rounded-2xl transition-all duration-300 text-left overflow-hidden border cursor-pointer",
                selectedChannel?.id === channel.id 
                  ? "ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/50" 
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:scale-[1.02]"
              )}
            >
              {viewMode === 'grid' ? (
                <div className="flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={channel.logo} 
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${channel.name}/400/225`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <button
                      onClick={(e) => toggleFavorite(e, channel.id)}
                      className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all group/fav"
                    >
                      <Heart 
                        size={14} 
                        className={cn(
                          "transition-all",
                          favorites.includes(channel.id) 
                            ? "fill-red-500 text-red-500 scale-110" 
                            : "text-white/60 group-hover/fav:text-white"
                        )} 
                      />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-white fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold truncate group-hover:text-emerald-400 transition-colors">{channel.name}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-black">
                    <img 
                      src={channel.logo} 
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${channel.name}/100/100`;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play size={14} className="text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">{channel.name}</p>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(e, channel.id)}
                    className="p-2 rounded-full hover:bg-white/5 transition-all group/fav"
                  >
                    <Heart 
                      size={16} 
                      className={cn(
                        "transition-all",
                        favorites.includes(channel.id) 
                          ? "fill-red-500 text-red-500 scale-110" 
                          : "text-white/20 group-hover/fav:text-white"
                      )} 
                    />
                  </button>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-emerald-500 transition-colors" />
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Search size={32} className="text-white/20" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">No channels found</p>
              <p className="text-sm text-white/40">Try adjusting your search or category filter</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
          Ztv • Built for Performance
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
