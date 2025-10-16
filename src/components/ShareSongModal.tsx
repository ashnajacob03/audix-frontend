import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from '@/components/UserAvatar';
import { X, Share2, Search, Check, Link as LinkIcon, MessageCircle, Facebook, Twitter, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface FriendItem {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  online?: boolean;
}

interface SongToShare {
  _id: string;
  title: string;
  artist: string;
}

interface ShareSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: SongToShare | null;
}

const ShareSongModal = ({ isOpen, onClose, song }: ShareSongModalProps) => {
  const { sendMessage } = useSocket();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const shareUrl = song ? `${window.location.origin}/song/${song._id}` : '';
  const shareText = song ? `Check out this song: ${song.title} by ${song.artist}` : 'Check this out';

  useEffect(() => {
    if (!isOpen) return;
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/user/friends`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data?.success) {
          setFriends((data.data?.friends || []) as FriendItem[]);
        }
      } catch (e) {
        // no-op; toast in UI
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSelected(new Set());
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(f => (f.name || '').toLowerCase().includes(q) || (f.email || '').toLowerCase().includes(q));
  }, [friends, search]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openShareWindow = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      // no-op
    }
  };

  const handleNativeShare = async () => {
    if (!song) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${song.title} • ${song.artist}`, text: shareText, url: shareUrl });
        toast.success('Share dialog opened');
      } else {
        await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
        toast.success('Link copied');
      }
    } catch (_) {
      // user cancelled or unsupported
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
      toast.success('Link copied to clipboard');
    } catch (_) {
      toast.error('Failed to copy link');
    }
  };

  const shareToWhatsapp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    openShareWindow(url);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    openShareWindow(url);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    openShareWindow(url);
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    openShareWindow(url);
  };

  const handleShare = async () => {
    if (!song) return;
    if (selected.size === 0) {
      toast.error('Select at least one friend');
      return;
    }
    const link = `${window.location.origin}/song/${song._id}`;
    const content = `🎵 Check out this song: ${song.title} by ${song.artist} — ${link}`;
    const targets = Array.from(selected);

    try {
      const token = localStorage.getItem('accessToken');
      const results = await Promise.allSettled(
        targets.map(async (receiverId) => {
          const res = await fetch(`${API_BASE_URL}/messages/send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ receiverId, content, messageType: 'text' }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({} as any));
            throw new Error(data?.message || `Failed to share to ${receiverId}`);
          }
        })
      );

      const failed = results.filter(r => r.status === 'rejected');
      const succeeded = results.length - failed.length;
      const succeededIds: string[] = results
        .map((r, idx) => ({ r, id: targets[idx] }))
        .filter(({ r }) => r.status === 'fulfilled')
        .map(({ id }) => id);
      if (succeeded > 0) {
        toast.success(`Shared with ${succeeded} friend${succeeded > 1 ? 's' : ''}`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length} share${failed.length > 1 ? 's' : ''} failed`);
      }
      onClose();
      // Redirect based on success count
      if (succeeded === 1) {
        navigate(`/messages?friendId=${succeededIds[0]}`);
      } else if (succeeded > 1) {
        navigate('/messages');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to share');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-950/95 backdrop-blur border border-white/10 rounded-2xl w-full max-w-xl mx-4 shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Share2 className="w-5 h-5" />
            Share song
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {song && (
          <div className="px-4 pt-3 pb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-sm text-zinc-200">
              <span className="font-medium truncate max-w-[240px]">{song.title}</span>
              <span className="text-zinc-500">•</span>
              <span className="truncate max-w-[160px] text-zinc-300">{song.artist}</span>
            </div>
          </div>
        )}

        <div className="p-4 pt-3">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search friends"
              className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 outline-none border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/10"
            />
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden">
            <ScrollArea className="h-72">
              {isLoading ? (
                <div className="p-4 text-zinc-400 text-sm">Loading friends…</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-zinc-400 text-sm text-center">No friends found</div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">Friends</div>
                  <ul className="divide-y divide-white/5">
                  {filtered.map(f => {
                    const isChecked = selected.has(f.id);
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(f.id)}
                          className={`w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-900/70 transition-colors ${isChecked ? 'bg-zinc-900/60' : ''}`}
                        >
                          {/* Selection indicator like WhatsApp */}
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${isChecked ? 'border-green-400 bg-green-500' : 'border-white/20 bg-transparent'}`}>
                            {isChecked && <Check className="w-3.5 h-3.5 text-black" />}
                          </span>
                          {/* Avatar */}
                          <div className={`rounded-full ${isChecked ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-zinc-900' : ''}`}>
                            <UserAvatar src={f.avatar} alt={f.name} size={'md'} />
                          </div>
                          {/* Texts */}
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm truncate ${isChecked ? 'text-white font-semibold' : 'text-zinc-200 font-medium'}`}>{f.name}</div>
                            <div className="text-xs text-zinc-500 truncate">{f.online ? 'Online' : (f.email || '')}</div>
                          </div>
                          {/* Presence */}
                          <div className={`hidden sm:flex items-center gap-2 ${f.online ? 'text-green-400' : 'text-zinc-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${f.online ? 'bg-green-500' : 'bg-zinc-600'}`} />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                  </ul>
                </>
              )}
             </ScrollArea>
           </div>
           
           {/* Professional Quick Share Section - Under Friends */}
           <div className="mt-4">
             <div className="text-xs font-medium text-zinc-300 mb-3">Quick Share</div>
             <div className="flex items-center justify-center gap-3">
               {/* WhatsApp */}
               <button 
                 onClick={shareToWhatsapp} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#2BD366] hover:to-[#0F7A6B] transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-[#25D366]/30"
                 title="Share on WhatsApp"
               >
                 <MessageCircle className="w-6 h-6 text-white" />
               </button>
               
               {/* Facebook */}
               <button 
                 onClick={shareToFacebook} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0D47A1] hover:from-[#1A7FF2] hover:to-[#0A3D91] transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-[#1877F2]/30"
                 title="Share on Facebook"
               >
                 <Facebook className="w-6 h-6 text-white" />
               </button>
               
               {/* X (Twitter) */}
               <button 
                 onClick={shareToTwitter} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-black to-zinc-800 hover:from-zinc-900 hover:to-zinc-700 transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-black/30"
                 title="Share on X"
               >
                 <Twitter className="w-6 h-6 text-white" />
               </button>
               
               {/* Telegram */}
               <button 
                 onClick={shareToTelegram} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] hover:from-[#3ABBEE] hover:to-[#32AED9] transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-[#2AABEE]/30"
                 title="Share on Telegram"
               >
                 <Send className="w-6 h-6 text-white" />
               </button>
               
               {/* Copy Link */}
               <button 
                 onClick={handleCopyLink} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-zinc-700/30"
                 title="Copy Link"
               >
                 <LinkIcon className="w-6 h-6 text-white" />
               </button>
               
               {/* Native Share */}
               <button 
                 onClick={handleNativeShare} 
                 className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-zinc-800/30"
                 title="More Options"
               >
                 <Share2 className="w-6 h-6 text-white" />
               </button>
             </div>
           </div>
         </div>

        {/* Professional Bottom Section */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Selection Counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                <span className="text-sm font-medium text-zinc-200">
                  {selected.size} {selected.size === 1 ? 'friend' : 'friends'} selected
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white font-medium text-sm transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600/50"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selected.size === 0}
                className={`group relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 transform ${
                  selected.size === 0 
                    ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700/30' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 border border-green-400/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Share2 className={`w-4 h-4 ${selected.size === 0 ? 'text-zinc-500' : 'text-white'}`} />
                  <span>Share</span>
                </div>
                {selected.size > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-500">{selected.size}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSongModal;

