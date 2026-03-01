export default function SessionDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading session details...</span>

      {/* Back link */}
      <div className="h-4 w-28 bg-neutral-800 rounded animate-pulse" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-7 w-56 bg-neutral-800 rounded-lg animate-pulse" />
          <div className="h-5 w-36 bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-48 bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="h-12 w-24 bg-neutral-800 rounded-xl animate-pulse" />
      </div>

      {/* Q&A cards */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-neutral-800 rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-3/4 bg-neutral-800 rounded-lg animate-pulse" />
            </div>
            <div className="border-l-2 border-neutral-800 pl-4 space-y-2">
              <div className="h-3 w-20 bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
