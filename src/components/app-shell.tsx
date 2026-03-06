'use client';

import { useAuth } from '@/lib/auth-context';
import { logOut } from '@/lib/firebase-client';
import { createCheckoutSession } from '@/lib/api-client';
import { Loader2, LogOut, History, UserCircle, BarChart3, Sparkles, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, plan } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      <header className="fixed top-0 left-0 right-0 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md z-40">
        <nav aria-label="Main navigation" className="h-16 px-6 flex items-center justify-between">
          <Link href="/interview" className="flex items-center gap-2" aria-current={pathname === '/interview' ? 'page' : undefined}>
            <span className="text-xl font-light tracking-tight">
              Star<span className="text-neutral-500 font-serif italic">la</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/history"
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Session History"
              aria-current={pathname.startsWith('/history') ? 'page' : undefined}
            >
              <History className="w-5 h-5" />
            </Link>
            <Link
              href="/analytics"
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Analytics"
              aria-current={pathname === '/analytics' ? 'page' : undefined}
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
            <Link
              href="/profile"
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Edit Profile"
              aria-current={pathname === '/profile' ? 'page' : undefined}
            >
              <UserCircle className="w-5 h-5" />
            </Link>
            {plan === 'pro' ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Pro
              </span>
            ) : (
              <button
                onClick={async () => {
                  setUpgrading(true);
                  try {
                    const { url } = await createCheckoutSession();
                    window.location.href = url;
                  } catch {
                    setUpgrading(false);
                  }
                }}
                disabled={upgrading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                {upgrading ? 'Loading...' : 'Upgrade'}
              </button>
            )}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || ''}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-neutral-800 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-800" aria-hidden="true" />
            )}
            <button
              onClick={() => logOut()}
              className="text-neutral-500 hover:text-white transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile: upgrade + hamburger */}
          <div className="flex sm:hidden items-center gap-3">
            {plan === 'pro' ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Pro
              </span>
            ) : (
              <button
                onClick={async () => {
                  setUpgrading(true);
                  try {
                    const { url } = await createCheckoutSession();
                    window.location.href = url;
                  } catch {
                    setUpgrading(false);
                  }
                }}
                disabled={upgrading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                {upgrading ? 'Loading...' : 'Upgrade'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-400 hover:text-white transition-colors p-1"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-neutral-900 bg-neutral-950/95 backdrop-blur-md px-6 py-4 space-y-1">
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              aria-current={pathname.startsWith('/history') ? 'page' : undefined}
            >
              <History className="w-5 h-5" />
              <span className="text-sm">History</span>
            </Link>
            <Link
              href="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              aria-current={pathname === '/analytics' ? 'page' : undefined}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Analytics</span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              aria-current={pathname === '/profile' ? 'page' : undefined}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-sm">Profile</span>
            </Link>
            <div className="border-t border-neutral-900 mt-2 pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); logOut(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 min-h-screen flex flex-col">{children}</main>
    </div>
  );
}
