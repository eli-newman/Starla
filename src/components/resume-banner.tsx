'use client';

import { motion } from 'motion/react';
import { Play, X, Clock, Loader2 } from 'lucide-react';
import type { InterviewDraft } from '@/types';

interface ResumeBannerProps {
  draft: InterviewDraft;
  onResume: () => void;
  onDiscard: () => void;
  isResuming: boolean;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ResumeBanner({ draft, onResume, onDiscard, isResuming }: ResumeBannerProps) {
  const answeredCount = draft.history.length;
  const totalQuestions = 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white">
            You have an interview in progress
          </h3>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>{answeredCount} of {totalQuestions} questions answered</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              saved {timeAgo(draft.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onResume}
          disabled={isResuming}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isResuming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Resume Interview
        </button>
        <button
          onClick={onDiscard}
          disabled={isResuming}
          className="text-neutral-400 hover:text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Start Fresh
        </button>
      </div>
    </motion.div>
  );
}
