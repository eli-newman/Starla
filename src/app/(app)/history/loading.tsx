export default function HistoryLoading() {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading session history...</span>
      <div className="space-y-2">
        <div className="h-8 w-48 bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-5 w-72 bg-neutral-800 rounded-lg animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
                <div className="h-3 w-56 bg-neutral-800 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-12 bg-neutral-800 rounded animate-pulse" />
                <div className="h-5 w-5 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
