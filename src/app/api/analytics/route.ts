import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, handleAuthError } from '@/lib/auth-middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminDb } from '@/lib/firebase-admin';
import type { AnalyticsData, SerializedInterviewTurn } from '@/types';
import { buildGamificationContext, computeStreak, computeXP, computeWeeklyGoal, computeAchievements } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyAuth(request);

    const rateLimitResult = checkRateLimit(uid, 'sessions');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 },
      );
    }

    let firestoreDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    try {
      const snapshot = await getAdminDb()
        .collection('interviews')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'asc')
        .get();
      firestoreDocs = snapshot.docs;
    } catch {
      // Composite index may not exist — fall back to unordered query
      try {
        const snapshot = await getAdminDb()
          .collection('interviews')
          .where('userId', '==', uid)
          .get();
        firestoreDocs = snapshot.docs.sort((a, b) => {
          const dateA = typeof a.data().createdAt === 'string' ? new Date(a.data().createdAt).getTime() : 0;
          const dateB = typeof b.data().createdAt === 'string' ? new Date(b.data().createdAt).getTime() : 0;
          return dateA - dateB;
        });
      } catch (firestoreError: unknown) {
        console.error('Firestore query error (analytics):', firestoreError);
      }
    }

    if (firestoreDocs.length === 0) {
      const empty: AnalyticsData = {
        totalSessions: 0,
        averageScore: 0,
        scoreHistory: [],
        strengthFrequency: [],
        improvementFrequency: [],
        questionTypeBreakdown: [],
        averageResponseTimeSeconds: undefined,
        averageSessionDurationSeconds: undefined,
        completionRate: undefined,
        difficultyBreakdown: undefined,
        inputModeBreakdown: undefined,
        averageAnswerWordCount: undefined,
        transcriptionEditRate: undefined,
        followUpRate: undefined,
        scoreDistribution: undefined,
      };
      return NextResponse.json(empty);
    }

    const sessions = firestoreDocs.map((doc) => doc.data());

    const totalSessions = sessions.length;
    const scores = sessions.map((s) => (typeof s.overallScore === 'number' ? s.overallScore : 0));
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);

    const scoreHistory = sessions.map((s) => ({
      date: typeof s.createdAt === 'string' ? s.createdAt.slice(0, 10) : '',
      score: typeof s.overallScore === 'number' ? s.overallScore : 0,
    }));

    // Aggregate strengths, improvements, and timing data
    const strengthMap = new Map<string, number>();
    const improvementMap = new Map<string, number>();
    const typeScores = new Map<string, { total: number; count: number }>();
    const difficultyScores = new Map<string, { total: number; count: number }>();
    const inputModeCounts = new Map<string, { count: number; totalScore: number }>();
    const responseTimes: number[] = [];
    const sessionDurations: number[] = [];
    const wordCounts: number[] = [];
    let completedCount = 0;
    let audioAnswerCount = 0;
    let transcriptionEditedCount = 0;
    let totalFollowUpsOffered = 0;
    let totalFollowUpsTaken = 0;

    for (const session of sessions) {
      // Session-level timing data
      if (typeof session.sessionDurationSeconds === 'number') {
        sessionDurations.push(session.sessionDurationSeconds);
      }
      if (session.completedAllQuestions === true) {
        completedCount++;
      }
      if (typeof session.followUpsOffered === 'number') {
        totalFollowUpsOffered += session.followUpsOffered;
      }
      if (typeof session.followUpsTaken === 'number') {
        totalFollowUpsTaken += session.followUpsTaken;
      }

      const history: SerializedInterviewTurn[] = Array.isArray(session.history) ? session.history : [];
      for (const turn of history) {
        // Per-question response time
        if (typeof turn.responseTimeSeconds === 'number') {
          responseTimes.push(turn.responseTimeSeconds);
        }

        // Word count
        if (typeof turn.answerWordCount === 'number') {
          wordCounts.push(turn.answerWordCount);
        }

        // Input mode tracking
        if (turn.inputMode) {
          const modeEntry = inputModeCounts.get(turn.inputMode) || { count: 0, totalScore: 0 };
          modeEntry.count++;
          modeEntry.totalScore += turn.feedback?.score || 0;
          inputModeCounts.set(turn.inputMode, modeEntry);
        }

        // Transcription edit tracking
        if (turn.inputMode === 'audio') {
          audioAnswerCount++;
          if (turn.transcriptionEdited === true) {
            transcriptionEditedCount++;
          }
        }

        if (turn.feedback) {
          // Strengths
          for (const s of turn.feedback.strengths || []) {
            strengthMap.set(s, (strengthMap.get(s) || 0) + 1);
          }
          // Improvements
          for (const imp of turn.feedback.improvements || []) {
            improvementMap.set(imp, (improvementMap.get(imp) || 0) + 1);
          }
          // Question type breakdown
          const qType = turn.question?.type || 'unknown';
          const existing = typeScores.get(qType) || { total: 0, count: 0 };
          existing.total += turn.feedback.score || 0;
          existing.count += 1;
          typeScores.set(qType, existing);

          // Difficulty breakdown
          const diff = turn.question?.difficulty || 'unknown';
          const diffEntry = difficultyScores.get(diff) || { total: 0, count: 0 };
          diffEntry.total += turn.feedback.score || 0;
          diffEntry.count += 1;
          difficultyScores.set(diff, diffEntry);
        }
      }
    }

    const strengthFrequency = Array.from(strengthMap.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const improvementFrequency = Array.from(improvementMap.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const questionTypeBreakdown = Array.from(typeScores.entries())
      .map(([type, { total, count }]) => ({
        type,
        avgScore: Math.round((total / count) * 10) / 10,
        count,
      }));

    const averageResponseTimeSeconds = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : undefined;
    const averageSessionDurationSeconds = sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : undefined;
    const completionRate = totalSessions > 0
      ? Math.round((completedCount / totalSessions) * 100)
      : undefined;

    const difficultyBreakdown = Array.from(difficultyScores.entries())
      .filter(([d]) => d !== 'unknown')
      .map(([difficulty, { total, count }]) => ({
        difficulty,
        avgScore: Math.round((total / count) * 10) / 10,
        count,
      }));

    const inputModeBreakdown = Array.from(inputModeCounts.entries())
      .map(([mode, { count, totalScore }]) => ({
        mode,
        count,
        avgScore: Math.round((totalScore / count) * 10) / 10,
      }));

    const averageAnswerWordCount = wordCounts.length > 0
      ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
      : undefined;

    const transcriptionEditRate = audioAnswerCount > 0
      ? Math.round((transcriptionEditedCount / audioAnswerCount) * 100)
      : undefined;

    const followUpRate = totalFollowUpsOffered > 0
      ? Math.round((totalFollowUpsTaken / totalFollowUpsOffered) * 100)
      : undefined;

    // Score distribution: group per-question scores into ranges
    const allQuestionScores = sessions.flatMap((s) => {
      const hist: SerializedInterviewTurn[] = Array.isArray(s.history) ? s.history : [];
      return hist.map((t) => t.feedback?.score || 0).filter((sc) => sc > 0);
    });
    const scoreDistribution = allQuestionScores.length > 0
      ? [
          { range: '1-3', count: allQuestionScores.filter((s) => s >= 1 && s <= 3).length },
          { range: '4-6', count: allQuestionScores.filter((s) => s >= 4 && s <= 6).length },
          { range: '7-10', count: allQuestionScores.filter((s) => s >= 7 && s <= 10).length },
        ]
      : undefined;

    // Gamification
    const gamCtx = buildGamificationContext(sessions as Parameters<typeof buildGamificationContext>[0]);
    const streak = computeStreak(gamCtx);
    const xp = computeXP(gamCtx);
    const weeklyGoal = computeWeeklyGoal(gamCtx);
    const achievements = computeAchievements(gamCtx);

    const analytics: AnalyticsData = {
      totalSessions,
      averageScore,
      scoreHistory,
      strengthFrequency,
      improvementFrequency,
      questionTypeBreakdown,
      averageResponseTimeSeconds,
      averageSessionDurationSeconds,
      completionRate,
      difficultyBreakdown: difficultyBreakdown.length > 0 ? difficultyBreakdown : undefined,
      inputModeBreakdown: inputModeBreakdown.length > 0 ? inputModeBreakdown : undefined,
      averageAnswerWordCount,
      transcriptionEditRate,
      followUpRate,
      scoreDistribution,
      streak,
      xp,
      achievements,
      weeklyGoal,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    return handleAuthError(error);
  }
}
