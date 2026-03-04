'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, RotateCcw, Award, History, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { InterviewTurn } from '@/types';

interface SummaryProps {
  history: InterviewTurn[];
  onRestart: () => void;
}

export function Summary({ history, onRestart }: SummaryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const averageScore = Math.round(
    history.reduce((acc, turn) => acc + (turn.feedback?.score || 0), 0) / history.length,
  );

  const allStrengths = Array.from(new Set(history.flatMap((turn) => turn.feedback?.strengths || [])));
  const allImprovements = Array.from(new Set(history.flatMap((turn) => turn.feedback?.improvements || [])));

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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

      {/* Phase 3D: Per-question accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Question Breakdown</h2>
        {history.map((turn, index) => {
          const isExpanded = expandedIndex === index;
          const isFollowUp = turn.question.id.startsWith('followup-');
          const scoreColor = (turn.feedback?.score || 0) >= 7
            ? 'text-green-400'
            : (turn.feedback?.score || 0) >= 5
              ? 'text-yellow-400'
              : 'text-red-400';

          return (
            <div key={turn.question.id} className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-800/30 transition-colors"
              >
                <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>
                  {turn.feedback?.score || 0}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{turn.question.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-xs font-mono text-neutral-400 uppercase">
                    {isFollowUp ? 'follow-up' : turn.question.type}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && turn.feedback && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-neutral-800 pt-4">
                      <div>
                        <h4 className="text-xs font-mono text-neutral-500 uppercase mb-1">Your Answer</h4>
                        <p className="text-sm text-neutral-300 leading-relaxed">{turn.userAnswer}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-green-400 font-mono text-xs uppercase mb-1">Strengths</h4>
                          <ul className="text-xs text-neutral-400 space-y-1">
                            {turn.feedback.strengths.map((s, i) => (
                              <li key={i} className="flex gap-1.5">
                                <span className="text-neutral-600 shrink-0">&bull;</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-red-400 font-mono text-xs uppercase mb-1">Improvements</h4>
                          <ul className="text-xs text-neutral-400 space-y-1">
                            {turn.feedback.improvements.map((s, i) => (
                              <li key={i} className="flex gap-1.5">
                                <span className="text-neutral-600 shrink-0">&bull;</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-blue-400 font-mono text-xs uppercase mb-1">Model Answer</h4>
                        <div className="text-xs text-neutral-400 italic prose prose-invert prose-xs max-w-none">
                          <ReactMarkdown>{turn.feedback.betterAnswer}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
