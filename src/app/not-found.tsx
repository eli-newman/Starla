import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-light text-white">404</h1>
        <p className="text-neutral-400 text-lg">Page not found</p>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors"
        >
          Go to Interview
        </Link>
      </div>
    </div>
  );
}
