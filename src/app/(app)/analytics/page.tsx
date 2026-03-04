'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Loader2, TrendingUp, BarChart3, Target, Award, ArrowRight, Clock, FileText, Mic, MessageSquare,
  Flame, Trophy, CalendarCheck, Check, Rocket, Layers, GraduationCap, Star, Zap, Calendar, Compass, CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { fetchAnalytics } from '@/lib/api-client';
import type { AnalyticsData, Achievement } from '@/types';

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  Rocket, Layers, GraduationCap, Star, TrendingUp, Zap, Flame, Calendar, Compass, CheckCircle,
};

function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ACHIEVEMENT_ICONS[name] || Award;
  return <Icon className={className} />;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <span className="sr-only">Loading analytics...</span>
      </div>
    );
  }

  if (error || !data || data.totalSessions === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center px-6">
        <BarChart3 className="w-12 h-12 text-neutral-700" />
        <h1 className="text-2xl font-light">No Data Yet</h1>
        <p className="text-neutral-500 max-w-sm">
          Complete your first interview session to start seeing analytics and performance trends.
        </p>
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors mt-2"
        >
          Start an Interview
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const maxScore = Math.max(...data.scoreHistory.map((s) => s.score), 10);

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-light mb-8">Analytics</h1>

        {/* Gamification Hero Strip */}
        {(data.streak || data.xp || data.weeklyGoal) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Streak Card */}
            {data.streak && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-sm font-mono text-neutral-500 uppercase tracking-wider">Streak</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{data.streak.currentStreak}</span>
                  <span className="text-sm text-neutral-500">day{data.streak.currentStreak !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Best: {data.streak.longestStreak} day{data.streak.longestStreak !== 1 ? 's' : ''}</span>
                  {!data.streak.practicedToday && (
                    <span className="text-xs text-orange-400 font-medium">Practice today!</span>
                  )}
                  {data.streak.practicedToday && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Done today
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* XP / Level Card */}
            {data.xp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-mono text-neutral-500 uppercase tracking-wider">Level {data.xp.currentLevel}</span>
                </div>
                <div className="mb-2">
                  <span className="text-lg font-bold text-white">{data.xp.currentLevelName}</span>
                </div>
                {data.xp.xpNeeded > 0 ? (
                  <>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.xp.xpProgress / data.xp.xpNeeded) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-neutral-600">{data.xp.xpProgress} / {data.xp.xpNeeded} XP to next level</span>
                  </>
                ) : (
                  <span className="text-xs text-yellow-400 font-medium">Max level reached!</span>
                )}
                <div className="mt-1">
                  <span className="text-xs text-neutral-600">{data.xp.totalXP.toLocaleString()} total XP</span>
                </div>
              </motion.div>
            )}

            {/* Weekly Goal Card */}
            {data.weeklyGoal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-mono text-neutral-500 uppercase tracking-wider">Weekly Goal</span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">{data.weeklyGoal.sessionsThisWeek}</span>
                  <span className="text-sm text-neutral-500">/ {data.weeklyGoal.weeklyTarget} sessions</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {Array.from({ length: data.weeklyGoal.weeklyTarget }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 flex-1 rounded-full transition-colors ${
                        i < data.weeklyGoal!.sessionsThisWeek
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : 'bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
                {data.weeklyGoal.sessionsThisWeek >= data.weeklyGoal.weeklyTarget ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Goal reached!
                  </span>
                ) : (
                  <span className="text-xs text-neutral-600">
                    {data.weeklyGoal.weeklyTarget - data.weeklyGoal.sessionsThisWeek} more to go
                  </span>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Target className="w-5 h-5 text-blue-400" />} label="Sessions" value={data.totalSessions} />
          <StatCard icon={<Award className="w-5 h-5 text-yellow-400" />} label="Avg Score" value={`${data.averageScore}/10`} />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            label="Best Score"
            value={`${Math.max(...data.scoreHistory.map((s) => s.score))}/10`}
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
            label="Questions"
            value={data.questionTypeBreakdown.reduce((a, b) => a + b.count, 0)}
          />
        </div>

        {/* Achievements Grid */}
        {data.achievements && data.achievements.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {data.achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {/* Score over time */}
        {data.scoreHistory.length > 1 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Score Over Time</h2>
            <div className="h-40 flex items-end gap-1">
              {data.scoreHistory.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-neutral-500 tabular-nums">{entry.score}</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 min-h-[4px] transition-all"
                    style={{ height: `${(entry.score / maxScore) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-neutral-600">{data.scoreHistory[0]?.date}</span>
              <span className="text-xs text-neutral-600">{data.scoreHistory[data.scoreHistory.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {/* Question type breakdown */}
        {data.questionTypeBreakdown.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Performance by Question Type</h2>
            <div className="space-y-4">
              {data.questionTypeBreakdown.map((item) => (
                <div key={item.type} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-neutral-400 uppercase w-24">{item.type}</span>
                  <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(item.avgScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-300 tabular-nums w-16 text-right">
                    {item.avgScore}/10
                  </span>
                  <span className="text-xs text-neutral-600 w-12 text-right">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary stats row */}
        {(data.averageResponseTimeSeconds != null || data.averageAnswerWordCount != null || data.completionRate != null || data.followUpRate != null) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {data.averageResponseTimeSeconds != null && (
              <StatCard icon={<Clock className="w-5 h-5 text-cyan-400" />} label="Avg Response" value={`${data.averageResponseTimeSeconds}s`} />
            )}
            {data.averageAnswerWordCount != null && (
              <StatCard icon={<FileText className="w-5 h-5 text-orange-400" />} label="Avg Words" value={data.averageAnswerWordCount} />
            )}
            {data.completionRate != null && (
              <StatCard icon={<Target className="w-5 h-5 text-emerald-400" />} label="Completion" value={`${data.completionRate}%`} />
            )}
            {data.followUpRate != null && (
              <StatCard icon={<MessageSquare className="w-5 h-5 text-pink-400" />} label="Follow-Up Rate" value={`${data.followUpRate}%`} />
            )}
          </div>
        )}

        {/* Score distribution */}
        {data.scoreDistribution && data.scoreDistribution.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Score Distribution</h2>
            <div className="flex items-end gap-4 h-32">
              {data.scoreDistribution.map((bucket) => {
                const maxCount = Math.max(...data.scoreDistribution!.map((b) => b.count), 1);
                return (
                  <div key={bucket.range} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-neutral-500 tabular-nums">{bucket.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-600 to-purple-400 min-h-[4px] transition-all"
                      style={{ height: `${(bucket.count / maxCount) * 100}%` }}
                    />
                    <span className="text-xs text-neutral-400 font-mono">{bucket.range}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Difficulty breakdown */}
        {data.difficultyBreakdown && data.difficultyBreakdown.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Performance by Difficulty</h2>
            <div className="space-y-4">
              {data.difficultyBreakdown.map((item) => (
                <div key={item.difficulty} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-neutral-400 uppercase w-24">{item.difficulty}</span>
                  <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(item.avgScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-300 tabular-nums w-16 text-right">
                    {item.avgScore}/10
                  </span>
                  <span className="text-xs text-neutral-600 w-12 text-right">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input mode breakdown */}
        {data.inputModeBreakdown && data.inputModeBreakdown.length > 0 && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-wider mb-4">Performance by Input Mode</h2>
            <div className="space-y-4">
              {data.inputModeBreakdown.map((item) => (
                <div key={item.mode} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-neutral-400 uppercase w-24 flex items-center gap-1.5">
                    {item.mode === 'audio' ? <Mic className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    {item.mode}
                  </span>
                  <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                      style={{ width: `${(item.avgScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-300 tabular-nums w-16 text-right">
                    {item.avgScore}/10
                  </span>
                  <span className="text-xs text-neutral-600 w-12 text-right">({item.count})</span>
                </div>
              ))}
            </div>
            {data.transcriptionEditRate != null && (
              <p className="text-xs text-neutral-600 mt-3">
                Transcription edit rate: {data.transcriptionEditRate}% of audio answers were edited
              </p>
            )}
          </div>
        )}

        {/* Strengths and improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.strengthFrequency.length > 0 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-sm font-mono text-green-400 uppercase tracking-wider mb-4">Top Strengths</h2>
              <ul className="space-y-2">
                {data.strengthFrequency.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-neutral-600 shrink-0">{item.count}x</span>
                    <span className="text-neutral-300">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.improvementFrequency.length > 0 && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-sm font-mono text-red-400 uppercase tracking-wider mb-4">Areas to Improve</h2>
              <ul className="space-y-2">
                {data.improvementFrequency.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-neutral-600 shrink-0">{item.count}x</span>
                    <span className="text-neutral-300">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
      {icon}
      <span className="text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-neutral-900/50 border rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-colors ${
        achievement.unlocked
          ? 'border-yellow-500/40'
          : 'border-neutral-800 opacity-60'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          achievement.unlocked
            ? 'bg-yellow-500/20'
            : 'bg-neutral-800'
        }`}
      >
        <AchievementIcon
          name={achievement.icon}
          className={`w-5 h-5 ${achievement.unlocked ? 'text-yellow-400' : 'text-neutral-600'}`}
        />
      </div>
      <span className={`text-xs font-medium ${achievement.unlocked ? 'text-white' : 'text-neutral-500'}`}>
        {achievement.title}
      </span>
      <span className="text-[10px] text-neutral-600 leading-tight">{achievement.description}</span>
      {!achievement.unlocked && achievement.progress != null && achievement.progress > 0 && (
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full bg-neutral-600"
            style={{ width: `${achievement.progress * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
