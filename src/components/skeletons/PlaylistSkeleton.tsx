const PlaylistSkeleton = () => {
  return (
    <div className="space-y-2 pr-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="p-2 rounded-md flex items-center gap-3 animate-pulse">
          <div className="size-12 bg-zinc-700 rounded-md flex-shrink-0" />
          <div className="flex-1 min-w-0 hidden md:block">
            <div className="h-4 bg-zinc-700 rounded mb-2" />
            <div className="h-3 bg-zinc-700 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistSkeleton;