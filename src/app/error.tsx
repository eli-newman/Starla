'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-light text-white">Something went wrong</h1>
        <p className="text-neutral-400">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
