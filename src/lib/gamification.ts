import type { StreakData, XPData, Achievement, WeeklyGoalData } from '@/types';

// --- Context passed to all gamification functions ---

export interface GamificationContext {
  sessions: {
    createdAt: string;
    overallScore: number;
    completedAllQuestions?: boolean;
    sessionDurationSeconds?: number;
    questionTypes?: Set<string>;
  }[];
}

// --- Streak ---

function uniqueDates(sessions: GamificationContext['sessions']): string[] {
  const dateSet = new Set<string>();
  for (const s of sessions) {
    if (typeof s.createdAt === 'string') {
      dateSet.add(s.createdAt.slice(0, 10));
    }
  }
  return Array.from(dateSet).sort();
}

function dayDiff(a: string, b: string): number {
  const msA = new Date(a + 'T00:00:00Z').getTime();
  const msB = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeStreak(ctx: GamificationContext): StreakData {
  const dates = uniqueDates(ctx.sessions);
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, practicedToday: false };
  }

  const today = todayUTC();
  const practicedToday = dates.includes(today);

  // Current streak: walk backward from today (or yesterday)
  let currentStreak = 0;
  const startDate = practicedToday ? today : (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  if (dates.includes(startDate)) {
    currentStreak = 1;
    let cursor = startDate;
    for (let i = dates.indexOf(cursor) - 1; i >= 0; i--) {
      const gap = dayDiff(dates[i], cursor);
      if (gap <= 2) {
        // Forgiving: gap of 1 (consecutive) or 2 (one day off) keeps streak
        currentStreak++;
        cursor = dates[i];
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 1;
  let runLength = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = dayDiff(dates[i - 1], dates[i]);
    if (gap <= 2) {
      runLength++;
    } else {
      runLength = 1;
    }
    longestStreak = Math.max(longestStreak, runLength);
  }

  return { currentStreak, longestStreak, practicedToday };
}

// --- XP & Levels ---

const LEVELS: { level: number; name: string; xpRequired: number }[] = [
  { level: 1, name: 'Newcomer', xpRequired: 0 },
  { level: 2, name: 'Warming Up', xpRequired: 100 },
  { level: 3, name: 'Getting Started', xpRequired: 300 },
  { level: 4, name: 'Practitioner', xpRequired: 600 },
  { level: 5, name: 'Confident', xpRequired: 1000 },
  { level: 6, name: 'Skilled', xpRequired: 1500 },
  { level: 7, name: 'Advanced', xpRequired: 2200 },
  { level: 8, name: 'Expert', xpRequired: 3000 },
  { level: 9, name: 'Master', xpRequired: 4000 },
  { level: 10, name: 'Interview Pro', xpRequired: 5500 },
];

export function computeSessionXP(session: {
  overallScore: number;
  completedAllQuestions?: boolean;
  sessionDurationSeconds?: number;
}): number {
  const base = 50;
  const scoreBonus = Math.round((session.overallScore || 0) * 5);
  const completionBonus = session.completedAllQuestions ? 25 : 0;
  const durationMinutes = Math.floor((session.sessionDurationSeconds || 0) / 60);
  const durationBonus = Math.min(durationMinutes, 30);
  return base + scoreBonus + completionBonus + durationBonus;
}

export function computeXP(ctx: GamificationContext): XPData {
  const totalXP = ctx.sessions.reduce((sum, s) => sum + computeSessionXP(s), 0);

  // Find current level
  let currentLevelIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      currentLevelIdx = i;
      break;
    }
  }

  const current = LEVELS[currentLevelIdx];
  const next = LEVELS[currentLevelIdx + 1] || null;

  const xpForCurrentLevel = current.xpRequired;
  const xpForNextLevel = next ? next.xpRequired : current.xpRequired;
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpNeeded = next ? xpForNextLevel - xpForCurrentLevel : 0;

  return {
    totalXP,
    currentLevel: current.level,
    currentLevelName: current.name,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    xpNeeded,
  };
}

// --- Weekly Goal ---

function getMondayUTC(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  return monday.toISOString().slice(0, 10);
}

export function computeWeeklyGoal(ctx: GamificationContext): WeeklyGoalData {
  const weekStart = getMondayUTC();
  const sessionsThisWeek = ctx.sessions.filter((s) => {
    if (typeof s.createdAt !== 'string') return false;
    return s.createdAt.slice(0, 10) >= weekStart;
  }).length;

  return {
    sessionsThisWeek,
    weeklyTarget: 3,
    weekStartDate: weekStart,
  };
}

// --- Achievements ---

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: GamificationContext) => boolean;
  progress: (ctx: GamificationContext) => number;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first interview session',
    icon: 'Rocket',
    check: (ctx) => ctx.sessions.length >= 1,
    progress: (ctx) => Math.min(ctx.sessions.length, 1),
  },
  {
    id: 'five_sessions',
    title: 'Getting Serious',
    description: 'Complete 5 interview sessions',
    icon: 'Layers',
    check: (ctx) => ctx.sessions.length >= 5,
    progress: (ctx) => Math.min(ctx.sessions.length / 5, 1),
  },
  {
    id: 'twenty_sessions',
    title: 'Dedicated Preparer',
    description: 'Complete 20 interview sessions',
    icon: 'GraduationCap',
    check: (ctx) => ctx.sessions.length >= 20,
    progress: (ctx) => Math.min(ctx.sessions.length / 20, 1),
  },
  {
    id: 'perfect_ten',
    title: 'Perfect 10',
    description: 'Score a perfect 10 in any session',
    icon: 'Star',
    check: (ctx) => ctx.sessions.some((s) => s.overallScore === 10),
    progress: (ctx) => {
      const best = Math.max(0, ...ctx.sessions.map((s) => s.overallScore));
      return Math.min(best / 10, 1);
    },
  },
  {
    id: 'consistent_achiever',
    title: 'Consistent Achiever',
    description: 'Score 7+ in 5 consecutive sessions',
    icon: 'TrendingUp',
    check: (ctx) => {
      let run = 0;
      for (const s of ctx.sessions) {
        run = s.overallScore >= 7 ? run + 1 : 0;
        if (run >= 5) return true;
      }
      return false;
    },
    progress: (ctx) => {
      let maxRun = 0;
      let run = 0;
      for (const s of ctx.sessions) {
        run = s.overallScore >= 7 ? run + 1 : 0;
        maxRun = Math.max(maxRun, run);
      }
      return Math.min(maxRun / 5, 1);
    },
  },
  {
    id: 'big_improvement',
    title: 'Breakthrough',
    description: 'Improve your score by 3+ between sessions',
    icon: 'Zap',
    check: (ctx) => {
      for (let i = 1; i < ctx.sessions.length; i++) {
        if (ctx.sessions[i].overallScore - ctx.sessions[i - 1].overallScore >= 3) return true;
      }
      return false;
    },
    progress: (ctx) => {
      let maxImprove = 0;
      for (let i = 1; i < ctx.sessions.length; i++) {
        maxImprove = Math.max(maxImprove, ctx.sessions[i].overallScore - ctx.sessions[i - 1].overallScore);
      }
      return Math.min(Math.max(maxImprove, 0) / 3, 1);
    },
  },
  {
    id: 'three_day_streak',
    title: 'On a Roll',
    description: 'Practice for 3 days in a row',
    icon: 'Flame',
    check: (ctx) => computeStreak(ctx).longestStreak >= 3,
    progress: (ctx) => Math.min(computeStreak(ctx).longestStreak / 3, 1),
  },
  {
    id: 'seven_day_streak',
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: 'Calendar',
    check: (ctx) => computeStreak(ctx).longestStreak >= 7,
    progress: (ctx) => Math.min(computeStreak(ctx).longestStreak / 7, 1),
  },
  {
    id: 'well_rounded',
    title: 'Well-Rounded',
    description: 'Answer behavioral, technical, and situational questions',
    icon: 'Compass',
    check: (ctx) => {
      const types = new Set<string>();
      for (const s of ctx.sessions) {
        if (s.questionTypes) {
          Array.from(s.questionTypes).forEach((t) => types.add(t));
        }
      }
      return types.has('behavioral') && types.has('technical') && types.has('situational');
    },
    progress: (ctx) => {
      const types = new Set<string>();
      for (const s of ctx.sessions) {
        if (s.questionTypes) {
          Array.from(s.questionTypes).forEach((t) => types.add(t));
        }
      }
      let count = 0;
      if (types.has('behavioral')) count++;
      if (types.has('technical')) count++;
      if (types.has('situational')) count++;
      return count / 3;
    },
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Complete all questions in 10 sessions',
    icon: 'CheckCircle',
    check: (ctx) => ctx.sessions.filter((s) => s.completedAllQuestions).length >= 10,
    progress: (ctx) => Math.min(ctx.sessions.filter((s) => s.completedAllQuestions).length / 10, 1),
  },
];

export function computeAchievements(ctx: GamificationContext): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const unlocked = def.check(ctx);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked,
      progress: unlocked ? undefined : Math.round(def.progress(ctx) * 100) / 100,
    };
  });
}

// --- Build context from raw session data ---

export function buildGamificationContext(
  sessions: {
    createdAt: string;
    overallScore: number;
    completedAllQuestions?: boolean;
    sessionDurationSeconds?: number;
    history?: { question?: { type?: string } }[];
  }[],
): GamificationContext {
  return {
    sessions: sessions.map((s) => ({
      createdAt: s.createdAt,
      overallScore: typeof s.overallScore === 'number' ? s.overallScore : 0,
      completedAllQuestions: s.completedAllQuestions,
      sessionDurationSeconds: s.sessionDurationSeconds,
      questionTypes: new Set(
        (s.history || [])
          .map((t) => t.question?.type)
          .filter((t): t is string => !!t),
      ),
    })),
  };
}
