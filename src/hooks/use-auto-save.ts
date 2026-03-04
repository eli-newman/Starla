'use client';

import { useEffect, useRef, useCallback } from 'react';
import { saveDraft } from '@/lib/api-client';
import { serializeHistory } from '@/lib/serialize-history';
import type { InterviewTurn, Question, ResearchData, InterviewDraft } from '@/types';
import { auth } from '@/lib/firebase-client';

interface AutoSaveState {
  jobDescription: string;
  companyName: string;
  mode?: 'targeted' | 'general';
  researchData: ResearchData | null;
  questions: Question[];
  currentQuestionIndex: number;
  history: InterviewTurn[];
  sessionStartTimestamp: number;
  followUpsOffered: number;
  followUpsTaken: number;
}

interface UseAutoSaveOptions {
  state: AutoSaveState;
  enabled: boolean;
}

function buildDraft(state: AutoSaveState): InterviewDraft {
  return {
    jobDescription: state.jobDescription,
    companyName: state.companyName || undefined,
    mode: state.mode,
    researchData: state.researchData!,
    questions: state.questions.map((q) => ({
      text: q.text,
      type: q.type,
      difficulty: q.difficulty,
      id: q.id,
    })),
    currentQuestionIndex: state.currentQuestionIndex,
    history: serializeHistory(state.history),
    sessionStartTimestamp: state.sessionStartTimestamp,
    followUpsOffered: state.followUpsOffered,
    followUpsTaken: state.followUpsTaken,
    updatedAt: new Date().toISOString(),
  };
}

function hashState(state: AutoSaveState): string {
  return JSON.stringify({
    qi: state.currentQuestionIndex,
    hl: state.history.length,
    ql: state.questions.length,
    fo: state.followUpsOffered,
    ft: state.followUpsTaken,
    // Include last answer to detect changes within the same question
    la: state.history[state.history.length - 1]?.userAnswer ?? '',
  });
}

export function useAutoSave({ state, enabled }: UseAutoSaveOptions) {
  const stateRef = useRef(state);
  const lastHashRef = useRef('');
  const isSavingRef = useRef(false);
  const dirtyRef = useRef(false);

  // Keep ref in sync
  stateRef.current = state;

  const doSave = useCallback(async (keepalive = false) => {
    const current = stateRef.current;
    if (!current.researchData || current.history.length === 0) return;
    if (isSavingRef.current) return;

    const currentHash = hashState(current);
    if (currentHash === lastHashRef.current) return;

    isSavingRef.current = true;
    try {
      const draft = buildDraft(current);
      if (keepalive) {
        // Use raw fetch with keepalive for beforeunload
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          fetch('/api/interview/draft', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(draft),
            keepalive: true,
          });
        }
      } else {
        await saveDraft(draft);
      }
      lastHashRef.current = currentHash;
      dirtyRef.current = false;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    // Save immediately after each confirmed answer
    doSave();
  }, [doSave]);

  // 30s interval save
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (dirtyRef.current) {
        doSave();
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [enabled, doSave]);

  // visibilitychange — save when tab goes hidden
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        doSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, doSave]);

  // beforeunload — last-ditch save with keepalive
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      doSave(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, doSave]);

  return { markDirty };
}
