export default function InterviewLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 h-full flex flex-col" role="status" aria-live="polite">
      <span className="sr-only">Loading interview...</span>
      <div className="flex-1 flex flex-col justify-center space-y-8 min-h-[40vh]">
        {/* Question type badge */}
        <div className="space-y-6">
          <div className="h-6 w-32 bg-neutral-800 rounded-full animate-pulse" />
          {/* Question text */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-8 w-1/2 bg-neutral-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Answer area */}
      <div className="mt-auto pt-8 border-t border-neutral-900 space-y-6">
        <div className="h-20 w-full bg-neutral-800 rounded-2xl animate-pulse" />
        <div className="flex items-center justify-center gap-4">
          <div className="h-px bg-neutral-900 flex-1" />
          <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
          <div className="h-px bg-neutral-900 flex-1" />
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
