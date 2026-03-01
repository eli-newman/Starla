'use client';

import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase-client';

export function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-md"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-light tracking-tight text-white">
            Star<span className="text-neutral-500 font-serif italic">la</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Master your next interview with AI-powered coaching and real-time feedback.
          </p>
        </div>

        <button
          onClick={() => signInWithGoogle()}
          aria-label="Sign in with Google"
          className="w-full bg-white text-black px-6 py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all shadow-xl"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="text-neutral-600 text-xs font-mono uppercase tracking-widest">
          Secure authentication via Firebase
        </p>
      </motion.div>
    </div>
  );
}
