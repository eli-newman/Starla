import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGet = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth-middleware', () => ({
  verifyAuth: vi.fn().mockResolvedValue({ uid: 'user-123' }),
  handleAuthError: vi.fn().mockImplementation((e: any) => {
    const { NextResponse } = require('next/server');
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }),
  AuthError: class extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } },
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({
    collection: () => ({
      where: () => ({
        orderBy: () => ({
          get: mockGet,
        }),
      }),
    }),
  }),
  getAdminAuth: () => ({ verifyIdToken: vi.fn() }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfter: 0 }),
}));

import { GET } from '@/app/api/analytics/route';
import { checkRateLimit } from '@/lib/rate-limit';

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/analytics', {
    headers: { Authorization: 'Bearer token' },
  });
}

describe('GET /api/analytics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty data for user with no sessions', async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    const response = await GET(makeRequest());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.totalSessions).toBe(0);
    expect(body.averageScore).toBe(0);
    expect(body.scoreHistory).toEqual([]);
    expect(body.strengthFrequency).toEqual([]);
    expect(body.improvementFrequency).toEqual([]);
    expect(body.questionTypeBreakdown).toEqual([]);
  });

  it('correctly aggregates multiple sessions', async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            userId: 'user-123',
            overallScore: 6,
            createdAt: '2025-06-01T00:00:00Z',
            history: [
              {
                question: { text: 'Q1', type: 'behavioral' },
                userAnswer: 'A1',
                feedback: { strengths: ['Clear communication'], improvements: ['Add examples'], betterAnswer: '', score: 6 },
              },
            ],
          }),
        },
        {
          data: () => ({
            userId: 'user-123',
            overallScore: 8,
            createdAt: '2025-06-10T00:00:00Z',
            history: [
              {
                question: { text: 'Q2', type: 'technical' },
                userAnswer: 'A2',
                feedback: { strengths: ['Clear communication', 'Good depth'], improvements: ['Be concise'], betterAnswer: '', score: 8 },
              },
            ],
          }),
        },
      ],
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalSessions).toBe(2);
    expect(body.averageScore).toBe(7);
    expect(body.scoreHistory).toHaveLength(2);
    expect(body.scoreHistory[0].date).toBe('2025-06-01');
    expect(body.scoreHistory[1].score).toBe(8);

    // Strengths: "Clear communication" appears in both → count 2
    const clearComm = body.strengthFrequency.find((s: any) => s.text === 'Clear communication');
    expect(clearComm.count).toBe(2);

    // Question type breakdown
    const behavioral = body.questionTypeBreakdown.find((q: any) => q.type === 'behavioral');
    expect(behavioral.avgScore).toBe(6);
    const technical = body.questionTypeBreakdown.find((q: any) => q.type === 'technical');
    expect(technical.avgScore).toBe(8);
  });

  it('includes gamification fields in response', async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            userId: 'user-123',
            overallScore: 7,
            createdAt: '2025-06-01T00:00:00Z',
            completedAllQuestions: true,
            sessionDurationSeconds: 900,
            history: [
              {
                question: { text: 'Q1', type: 'behavioral' },
                userAnswer: 'A1',
                feedback: { strengths: [], improvements: [], betterAnswer: '', score: 7 },
              },
            ],
          }),
        },
      ],
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    // Streak
    expect(body.streak).toBeDefined();
    expect(typeof body.streak.currentStreak).toBe('number');
    expect(typeof body.streak.longestStreak).toBe('number');
    expect(typeof body.streak.practicedToday).toBe('boolean');

    // XP
    expect(body.xp).toBeDefined();
    expect(body.xp.totalXP).toBeGreaterThan(0);
    expect(body.xp.currentLevel).toBeGreaterThanOrEqual(1);
    expect(typeof body.xp.currentLevelName).toBe('string');

    // Achievements
    expect(body.achievements).toBeDefined();
    expect(Array.isArray(body.achievements)).toBe(true);
    expect(body.achievements.length).toBe(10);
    // first_session should be unlocked with 1 session
    const firstSession = body.achievements.find((a: any) => a.id === 'first_session');
    expect(firstSession.unlocked).toBe(true);

    // Weekly goal
    expect(body.weeklyGoal).toBeDefined();
    expect(typeof body.weeklyGoal.sessionsThisWeek).toBe('number');
    expect(body.weeklyGoal.weeklyTarget).toBe(3);
  });

  it('returns undefined gamification fields for empty state', async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    const response = await GET(makeRequest());
    const body = await response.json();
    expect(body.totalSessions).toBe(0);
    // Gamification fields should not be present in empty state
    expect(body.streak).toBeUndefined();
    expect(body.xp).toBeUndefined();
    expect(body.achievements).toBeUndefined();
    expect(body.weeklyGoal).toBeUndefined();
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValueOnce({ allowed: false, retryAfter: 15 });
    const response = await GET(makeRequest());
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error).toContain('15 seconds');
  });
});
