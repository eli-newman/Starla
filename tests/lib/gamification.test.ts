import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  computeStreak,
  computeSessionXP,
  computeXP,
  computeWeeklyGoal,
  computeAchievements,
  buildGamificationContext,
  type GamificationContext,
} from '@/lib/gamification';

function makeCtx(
  sessions: Partial<GamificationContext['sessions'][0]>[] = [],
): GamificationContext {
  return {
    sessions: sessions.map((s) => ({
      createdAt: s.createdAt ?? '2025-06-01T12:00:00Z',
      overallScore: s.overallScore ?? 5,
      completedAllQuestions: s.completedAllQuestions,
      sessionDurationSeconds: s.sessionDurationSeconds,
      questionTypes: s.questionTypes ?? new Set<string>(),
    })),
  };
}

// --- Streak ---

describe('computeStreak', () => {
  it('returns zero streak for no sessions', () => {
    const result = computeStreak(makeCtx([]));
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.practicedToday).toBe(false);
  });

  it('returns 1 for single session today', () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = computeStreak(makeCtx([{ createdAt: `${today}T10:00:00Z` }]));
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.practicedToday).toBe(true);
  });

  it('counts consecutive days', () => {
    const dates = ['2025-06-01', '2025-06-02', '2025-06-03'];
    // Mock "today" to be 2025-06-03
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-03T12:00:00Z'));
    const result = computeStreak(makeCtx(dates.map((d) => ({ createdAt: `${d}T10:00:00Z` }))));
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    vi.useRealTimers();
  });

  it('breaks streak after 2-day gap', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-10T12:00:00Z'));
    const result = computeStreak(
      makeCtx([
        { createdAt: '2025-06-01T10:00:00Z' },
        { createdAt: '2025-06-02T10:00:00Z' },
        // gap: 3 days (3, 4, 5 missing)
        { createdAt: '2025-06-08T10:00:00Z' },
        { createdAt: '2025-06-09T10:00:00Z' },
        { createdAt: '2025-06-10T10:00:00Z' },
      ]),
    );
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    vi.useRealTimers();
  });

  it('uses forgiving model (1 day gap keeps streak)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-05T12:00:00Z'));
    const result = computeStreak(
      makeCtx([
        { createdAt: '2025-06-01T10:00:00Z' },
        // skipped June 2
        { createdAt: '2025-06-03T10:00:00Z' },
        { createdAt: '2025-06-04T10:00:00Z' },
        { createdAt: '2025-06-05T10:00:00Z' },
      ]),
    );
    // forgiving: gap of 2 days (June 1 → June 3) still counts
    expect(result.currentStreak).toBe(4);
    vi.useRealTimers();
  });

  it('tracks longest vs current independently', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-20T12:00:00Z'));
    const result = computeStreak(
      makeCtx([
        // 5-day streak (longest)
        { createdAt: '2025-06-01T10:00:00Z' },
        { createdAt: '2025-06-02T10:00:00Z' },
        { createdAt: '2025-06-03T10:00:00Z' },
        { createdAt: '2025-06-04T10:00:00Z' },
        { createdAt: '2025-06-05T10:00:00Z' },
        // big gap
        // 2-day current streak
        { createdAt: '2025-06-19T10:00:00Z' },
        { createdAt: '2025-06-20T10:00:00Z' },
      ]),
    );
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(5);
    vi.useRealTimers();
  });
});

// --- Session XP ---

describe('computeSessionXP', () => {
  it('gives base XP of 50 for minimal session', () => {
    expect(computeSessionXP({ overallScore: 0 })).toBe(50);
  });

  it('adds score bonus', () => {
    expect(computeSessionXP({ overallScore: 10 })).toBe(50 + 50); // 10 * 5
  });

  it('adds completion bonus', () => {
    expect(computeSessionXP({ overallScore: 0, completedAllQuestions: true })).toBe(50 + 25);
  });

  it('adds duration bonus capped at 30', () => {
    // 45 minutes → capped at 30
    expect(computeSessionXP({ overallScore: 0, sessionDurationSeconds: 2700 })).toBe(50 + 30);
    // 10 minutes
    expect(computeSessionXP({ overallScore: 0, sessionDurationSeconds: 600 })).toBe(50 + 10);
  });

  it('computes max XP correctly', () => {
    const max = computeSessionXP({
      overallScore: 10,
      completedAllQuestions: true,
      sessionDurationSeconds: 3600,
    });
    expect(max).toBe(50 + 50 + 25 + 30); // 155
  });
});

// --- XP / Levels ---

describe('computeXP', () => {
  it('returns level 1 for no sessions', () => {
    const result = computeXP(makeCtx([]));
    expect(result.totalXP).toBe(0);
    expect(result.currentLevel).toBe(1);
    expect(result.currentLevelName).toBe('Newcomer');
  });

  it('reaches level 2 after 1 decent session', () => {
    // 1 session: score=8 → 50 + 40 = 90 ... needs 100. Add completion:
    const result = computeXP(
      makeCtx([{ overallScore: 8, completedAllQuestions: true, sessionDurationSeconds: 600 }]),
    );
    // 50 + 40 + 25 + 10 = 125 XP → level 2
    expect(result.totalXP).toBe(125);
    expect(result.currentLevel).toBe(2);
  });

  it('reaches level 10 at 5500+ XP', () => {
    // Each session max 155 XP, need ~36 sessions
    const sessions = Array.from({ length: 40 }, () => ({
      overallScore: 10,
      completedAllQuestions: true as const,
      sessionDurationSeconds: 3600,
    }));
    const result = computeXP(makeCtx(sessions));
    expect(result.totalXP).toBe(155 * 40); // 6200
    expect(result.currentLevel).toBe(10);
    expect(result.currentLevelName).toBe('Interview Pro');
    // At max level, xpNeeded should be 0
    expect(result.xpNeeded).toBe(0);
  });

  it('calculates progress within current level', () => {
    // 2 sessions × 50 XP (base only) = 100 XP → exactly level 2 (100-300 range)
    const result = computeXP(makeCtx([{ overallScore: 0 }, { overallScore: 0 }]));
    expect(result.totalXP).toBe(100);
    expect(result.currentLevel).toBe(2);
    expect(result.xpProgress).toBe(0); // exactly at level boundary
    expect(result.xpNeeded).toBe(200); // 300 - 100
  });
});

// --- Weekly Goal ---

describe('computeWeeklyGoal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Wednesday, June 4, 2025
    vi.setSystemTime(new Date('2025-06-04T14:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('counts sessions from this week only', () => {
    const result = computeWeeklyGoal(
      makeCtx([
        { createdAt: '2025-05-30T10:00:00Z' }, // last Friday — excluded
        { createdAt: '2025-06-02T10:00:00Z' }, // Monday — included
        { createdAt: '2025-06-04T10:00:00Z' }, // Wednesday — included
      ]),
    );
    expect(result.sessionsThisWeek).toBe(2);
    expect(result.weeklyTarget).toBe(3);
    expect(result.weekStartDate).toBe('2025-06-02');
  });

  it('returns 0 when no sessions this week', () => {
    const result = computeWeeklyGoal(
      makeCtx([{ createdAt: '2025-05-20T10:00:00Z' }]),
    );
    expect(result.sessionsThisWeek).toBe(0);
  });
});

// --- Achievements ---

describe('computeAchievements', () => {
  it('unlocks first_session with 1 session', () => {
    const achievements = computeAchievements(makeCtx([{ overallScore: 5 }]));
    const first = achievements.find((a) => a.id === 'first_session');
    expect(first?.unlocked).toBe(true);
  });

  it('shows progress for five_sessions', () => {
    const achievements = computeAchievements(
      makeCtx([{ overallScore: 5 }, { overallScore: 6 }]),
    );
    const five = achievements.find((a) => a.id === 'five_sessions');
    expect(five?.unlocked).toBe(false);
    expect(five?.progress).toBe(0.4); // 2/5
  });

  it('unlocks perfect_ten', () => {
    const achievements = computeAchievements(makeCtx([{ overallScore: 10 }]));
    const perfect = achievements.find((a) => a.id === 'perfect_ten');
    expect(perfect?.unlocked).toBe(true);
  });

  it('unlocks consistent_achiever with 5 consecutive 7+ scores', () => {
    const sessions = [7, 8, 7, 9, 7].map((s) => ({ overallScore: s }));
    const achievements = computeAchievements(makeCtx(sessions));
    const consistent = achievements.find((a) => a.id === 'consistent_achiever');
    expect(consistent?.unlocked).toBe(true);
  });

  it('does not unlock consistent_achiever when broken', () => {
    const sessions = [7, 8, 5, 9, 7].map((s) => ({ overallScore: s }));
    const achievements = computeAchievements(makeCtx(sessions));
    const consistent = achievements.find((a) => a.id === 'consistent_achiever');
    expect(consistent?.unlocked).toBe(false);
    expect(consistent?.progress).toBe(0.4); // max run of 2/5
  });

  it('unlocks big_improvement', () => {
    const achievements = computeAchievements(
      makeCtx([{ overallScore: 4 }, { overallScore: 7 }]),
    );
    const big = achievements.find((a) => a.id === 'big_improvement');
    expect(big?.unlocked).toBe(true);
  });

  it('unlocks well_rounded', () => {
    const achievements = computeAchievements(
      makeCtx([
        { questionTypes: new Set(['behavioral']) },
        { questionTypes: new Set(['technical']) },
        { questionTypes: new Set(['situational']) },
      ]),
    );
    const wr = achievements.find((a) => a.id === 'well_rounded');
    expect(wr?.unlocked).toBe(true);
  });

  it('unlocks completionist with 10 completed sessions', () => {
    const sessions = Array.from({ length: 10 }, () => ({
      completedAllQuestions: true as const,
    }));
    const achievements = computeAchievements(makeCtx(sessions));
    const comp = achievements.find((a) => a.id === 'completionist');
    expect(comp?.unlocked).toBe(true);
  });

  it('returns all 10 achievements', () => {
    const achievements = computeAchievements(makeCtx([]));
    expect(achievements).toHaveLength(10);
  });
});

// --- buildGamificationContext ---

describe('buildGamificationContext', () => {
  it('extracts question types from history', () => {
    const ctx = buildGamificationContext([
      {
        createdAt: '2025-06-01T10:00:00Z',
        overallScore: 7,
        history: [
          { question: { type: 'behavioral' } },
          { question: { type: 'technical' } },
        ],
      },
    ]);
    expect(ctx.sessions[0].questionTypes).toEqual(new Set(['behavioral', 'technical']));
  });

  it('handles missing history gracefully', () => {
    const ctx = buildGamificationContext([
      { createdAt: '2025-06-01T10:00:00Z', overallScore: 5 },
    ]);
    expect(ctx.sessions[0].questionTypes).toEqual(new Set());
  });
});
