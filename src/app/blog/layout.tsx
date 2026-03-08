import Link from 'next/link';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-neutral-950/70 backdrop-blur-xl border border-neutral-900 rounded-2xl px-6 py-3">
          <Link
            href="/"
            className="text-xl font-light tracking-tight text-white"
          >
            Star<span className="text-neutral-500 font-serif italic">la</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-8 text-sm text-neutral-500">
            <Link href="/#how-it-works" className="hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors text-neutral-300">
              Blog
            </Link>
          </nav>

          <Link
            href="/login"
            className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="pt-24 min-h-screen">{children}</main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-6 py-8 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-neutral-600 text-sm">
            &copy; {new Date().getFullYear()} Starla. All rights reserved.
          </div>
          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            <Link href="/#how-it-works" className="hover:text-neutral-300 transition-colors">
              How it works
            </Link>
            <Link href="/#pricing" className="hover:text-neutral-300 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-neutral-300 transition-colors">
              Blog
            </Link>
            <a href="mailto:eli@starla-ai.com" className="hover:text-neutral-300 transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
