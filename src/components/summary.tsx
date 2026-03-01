'use client';

import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, RotateCcw, Award, History } from 'lucide-react';
import Link from 'next/link';
import type { InterviewTurn } from '@/types';

interface SummaryProps {
  history: InterviewTurn[];
  onRestart: () => void;
}

export function Summary({ history, onRestart }: SummaryProps) {
  const averageScore = Math.round(
    history.reduce((acc, turn) => acc + (turn.feedback?.score || 0), 0) / history.length,
  );

  const allStrengths = Array.from(new Set(history.flatMap((turn) => turn.feedback?.strengths || [])));
  const allImprovements = Array.from(new Set(history.flatMap((turn) => turn.feedback?.improvements || [])));

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 mb-4">
          <Award className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-light">Interview Complete</h1>
        <div className="flex items-center justify-center gap-2 text-neutral-400" aria-label={`Overall score: ${averageScore} out of 10`}>
          <span>Overall Score:</span>
          <span className="text-2xl font-bold text-white">{averageScore}/10</span>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckCircle className="w-5 h-5" />
            <h2 className="font-medium uppercase tracking-wider text-sm">Key Strengths</h2>
          </div>
          <ul className="space-y-3">
            {allStrengths.slice(0, 5).map((s, i) => (
              <li key={i} className="text-neutral-300 text-sm leading-relaxed flex gap-2">
                <span className="text-neutral-600">&bull;</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-medium uppercase tracking-wider text-sm">Areas to Improve</h2>
          </div>
          <ul className="space-y-3">
            {allImprovements.slice(0, 5).map((s, i) => (
              <li key={i} className="text-neutral-300 text-sm leading-relaxed flex gap-2">
                <span className="text-neutral-600">&bull;</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4 pt-8"
      >
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Session
        </button>
        <Link
          href="/history"
          aria-label="View all past interview sessions"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition-colors font-medium"
        >
          <History className="w-4 h-4" />
          View History
        </Link>
      </motion.div>
    </div>
  );
}
