'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { fetchSession } from '@/lib/api-client';
import type { InterviewSession } from '@/types';
import { ShareScoreModal } from './share-score-card';

interface SessionDetailProps {
  sessionId: string;
}

export function SessionDetail({ sessionId }: SessionDetailProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareQuestion, setShareQuestion] = useState<number | null>(null);

  useEffect(() => {
    fetchSession(sessionId)
      .then((data) => setSession(data.session))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <span className="sr-only">Loading session details...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-red-400">{error || 'Session not found'}</p>
        <Link href="/history" className="text-neutral-400 hover:text-white transition-colors">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Link
          href="/history"
          aria-label="Back to session history"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Link>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-neutral-500" />
              <h1 className="text-2xl font-light">{session.profile.role || 'Interview Session'}</h1>
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <Building className="w-4 h-4 text-neutral-600" />
              <span>{session.profile.company || 'Unknown Company'}</span>
            </div>
            <p className="text-xs text-neutral-600 font-mono">
              {new Date(session.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3" aria-label={`Overall score: ${session.overallScore} out of 10`}>
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">{session.overallScore}/10</span>
          </div>
        </div>
      </motion.div>

      {shareQuestion !== null && session.history[shareQuestion]?.feedback && (
        <ShareScoreModal
          score={session.history[shareQuestion].feedback!.score}
          strengths={session.history[shareQuestion].feedback!.strengths}
          questionType={session.history[shareQuestion].question.type}
          questionNumber={shareQuestion + 1}
          onClose={() => setShareQuestion(null)}
        />
      )}

      {/* Q&A History */}
      <div className="space-y-6">
        {session.history.map((turn, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4"
          >
            {/* Question */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-xs font-mono text-neutral-400 uppercase">
                  {turn.question.type}
                </span>
                <span className="text-xs text-neutral-600">Question {index + 1}</span>
              </div>
              <h3 className="text-lg font-light">{turn.question.text}</h3>
            </div>

            {/* Answer */}
            <div className="border-l-2 border-neutral-800 pl-4">
              <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Your Answer</p>
              <p className="text-neutral-300 text-sm">{turn.userAnswer}</p>
            </div>

            {/* Feedback */}
            {turn.feedback && (
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-mono uppercase">Feedback</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShareQuestion(index)}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                    <span className="font-bold">{turn.feedback.score}/10</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {turn.feedback.strengths.map((s, i) => (
                        <li key={i} className="text-neutral-300 flex gap-2">
                          <span className="text-neutral-600">-</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase">Improvements</span>
                    </div>
                    <ul className="space-y-1">
                      {turn.feedback.improvements.map((s, i) => (
                        <li key={i} className="text-neutral-300 flex gap-2">
                          <span className="text-neutral-600">-</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-blue-400 font-mono uppercase mb-1">Better Answer</p>
                  <div className="text-neutral-300 text-sm italic prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{turn.feedback.betterAnswer}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
