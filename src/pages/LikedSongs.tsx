import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';

const LikedSongs = () => {
  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
            <p className="text-zinc-400 mt-2">Your liked songs will appear here.</p>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default LikedSongs;


