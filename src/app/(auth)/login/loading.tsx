export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950" role="status" aria-live="polite">
      <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
