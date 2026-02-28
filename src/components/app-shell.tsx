'use client';

import { useAuth } from '@/lib/auth-context';
import { logOut } from '@/lib/firebase-client';
import { Loader2, LogOut, History } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md z-40 px-6 flex items-center justify-between">
        <Link href="/interview" className="flex items-center gap-2">
          <span className="text-xl font-light tracking-tight">
            Star<span className="text-neutral-500 font-serif italic">la</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/history"
            className="text-neutral-500 hover:text-white transition-colors"
            title="Session History"
          >
            <History className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 pr-4 border-r border-neutral-900">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || ''}
                className="w-8 h-8 rounded-full border border-neutral-800"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border border-neutral-800 bg-neutral-800" />
            )}
            <span className="text-sm text-neutral-400 hidden sm:inline">
              {user.displayName}
            </span>
          </div>
          <button
            onClick={() => logOut()}
            className="text-neutral-500 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-16 min-h-screen flex flex-col">{children}</main>
    </div>
  );
}
