'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Award, Briefcase, Building, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchSessions } from '@/lib/api-client';
import type { InterviewSession } from '@/types';

export function SessionList() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions()
      .then((data) => setSessions(data.sessions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-neutral-500 text-lg">No interview sessions yet.</p>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors"
        >
          Start Your First Interview
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/history/${session.id}`}
            className="block bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  <span className="font-medium">{session.profile.role}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <Building className="w-4 h-4 text-neutral-600" />
                  <span>{session.profile.company}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(session.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}</span>
                  <span className="text-neutral-700">|</span>
                  <span>{session.history.length} questions</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold">{session.overallScore}/10</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
