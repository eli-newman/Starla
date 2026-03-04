'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Search, FileText, MessageSquare, Lock } from 'lucide-react';
import { ProfileSetup } from './profile-setup';
import { JobSetupForm } from './job-setup';
import { Interview } from './interview';
import { Summary } from './summary';
import { useAuth } from '@/lib/auth-context';
import {
  fetchResearch,
  fetchQuestion,
  fetchEvaluation,
  fetchTranscription,
  fetchTTS,
  blobToBase64,
  base64ToAudioUrl,
  saveSession,
  fetchDraft,
  deleteDraft,
  fetchUsage,
  createCheckoutSession,
} from '@/lib/api-client';
import { useToast } from '@/components/toast';
import { useAutoSave } from '@/hooks/use-auto-save';
import { serializeHistory } from '@/lib/serialize-history';
import { ResumeBanner } from './resume-banner';
import type {
  ResearchData,
  Question,
  InterviewTurn,
  InterviewStep,
  JobSetup,
  InterviewDraft,
} from '@/types';

const MAX_QUESTIONS = 5;

interface PrefetchedQuestion {
  question: Question;
  audioUrl?: string;
}

export function InterviewFlow() {
  const { profile, profileLoading, hasProfile } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<InterviewStep>('profile-setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobSetup, setJobSetup] = useState<JobSetup | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<InterviewTurn[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);

  const [researchStep, setResearchStep] = useState(0);

  // Phase 3B: Answer preview state
  const [previewText, setPreviewText] = useState<string | null>(null);

  // Phase 3E: Pre-fetch next question
  const prefetchRef = useRef<PrefetchedQuestion | null>(null);
  const prefetchingRef = useRef(false);

  // Timing tracking
  const questionShownAtRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);

  // Data collection: input mode, transcription editing, follow-up tracking
  const inputModeRef = useRef<'audio' | 'typed'>('typed');
  const originalTranscriptionRef = useRef<string | null>(null);
  const followUpsOfferedRef = useRef(0);
  const followUpsTakenRef = useRef(0);

  // Quota state
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Draft resume state
  const [draftToResume, setDraftToResume] = useState<InterviewDraft | null>(null);

  // Auto-save hook
  const { markDirty } = useAutoSave({
    state: {
      jobDescription: jobSetup?.jobDescription ?? '',
      companyName: jobSetup?.companyName ?? '',
      researchData,
      questions,
      currentQuestionIndex,
      history,
      sessionStartTimestamp: sessionStartRef.current,
      followUpsOffered: followUpsOfferedRef.current,
      followUpsTaken: followUpsTakenRef.current,
    },
    enabled: step === 'interview',
  });

  // Determine initial step based on profile state + fetch draft
  useEffect(() => {
    if (profileLoading) return;
    if (hasProfile) {
      setStep('job-setup');
      // Check for an existing draft to resume
      fetchDraft()
        .then(({ draft }) => {
          if (draft) setDraftToResume(draft);
        })
        .catch(() => {});
    } else {
      setStep('profile-setup');
    }
  }, [profileLoading, hasProfile]);

  // Save to DB when summary is reached + delete draft
  useEffect(() => {
    if (step === 'summary' && history.length > 0 && profile && jobSetup) {
      const overallScore = Math.round(
        history.reduce((acc, turn) => acc + (turn.feedback?.score || 0), 0) / history.length,
      );
      const mainQuestionsAnswered = history.filter((h) => !h.question.id.startsWith('followup-')).length;
      const sessionDurationSeconds = sessionStartRef.current > 0
        ? Math.round((Date.now() - sessionStartRef.current) / 1000)
        : undefined;
      saveSession({
        profile: {
          ...profile,
          role: researchData?.role || 'Interview Session',
          company: jobSetup.companyName || researchData?.company || '',
        },
        jobDescription: jobSetup.jobDescription,
        history: serializeHistory(history),
        overallScore,
        sessionDurationSeconds,
        completedAllQuestions: mainQuestionsAnswered >= MAX_QUESTIONS,
        followUpsOffered: followUpsOfferedRef.current || undefined,
        followUpsTaken: followUpsTakenRef.current || undefined,
      }).catch((err) => {
        console.error('Failed to save session:', err);
        toast.error('Failed to save session to history.');
      });
      // Draft is cleaned up server-side in sessions POST, but also delete client-side
      deleteDraft().catch(() => {});
    }
  }, [step, history, profile, jobSetup, researchData, toast]);

  // Phase 3E: Pre-fetch next question when feedback is displayed
  const prefetchNextQuestion = useCallback(async (currentHistory: InterviewTurn[], research: ResearchData) => {
    if (prefetchingRef.current) return;
    // Don't prefetch if we've hit the question limit
    const mainQuestionsAsked = currentHistory.filter((h) => !h.question.id.startsWith('followup-')).length;
    if (mainQuestionsAsked >= MAX_QUESTIONS) return;

    prefetchingRef.current = true;
    try {
      const data = await fetchQuestion({ history: serializeHistory(currentHistory), researchData: research });
      const q: Question = {
        id: crypto.randomUUID(),
        text: data.text,
        type: data.type as Question['type'],
        difficulty: data.difficulty as Question['difficulty'],
      };

      let audioUrl: string | undefined;
      try {
        const tts = await fetchTTS({ text: q.text });
        audioUrl = base64ToAudioUrl(tts.audioBase64, tts.sampleRate);
      } catch {
        // TTS is optional
      }

      prefetchRef.current = { question: q, audioUrl };
    } catch {
      prefetchRef.current = null;
    } finally {
      prefetchingRef.current = false;
    }
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const result = await createCheckoutSession();
      if (!result.url) {
        throw new Error('No checkout URL returned');
      }
      window.location.assign(result.url);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start upgrade. Please try again.');
      setUpgradeLoading(false);
    }
  };

  const handleJobSetupComplete = async (data: JobSetup) => {
    if (!profile) return;

    // Check quota before starting
    try {
      const usage = await fetchUsage();
      if (usage.plan === 'free' && usage.sessionsThisMonth >= usage.limit) {
        setJobSetup(data);
        setQuotaExceeded(true);
        return;
      }
    } catch {
      // If usage check fails, let the server-side check in POST /api/sessions handle it
    }

    setJobSetup(data);
    setStep('researching');
    setIsProcessing(true);
    setResearchStep(0);

    try {
      // No client-side extraction — just show generic spinner

      setResearchStep(1);

      // Run research with JD + profile data
      const research = await fetchResearch({
        jobDescription: data.jobDescription,
        resume: profile.resume,
        experience: profile.experience,
      });
      setResearchData(research);
      setResearchStep(2);

      const firstQuestionData = await fetchQuestion({ history: [], researchData: research });
      const firstQuestion: Question = {
        id: crypto.randomUUID(),
        text: firstQuestionData.text,
        type: firstQuestionData.type as Question['type'],
        difficulty: firstQuestionData.difficulty as Question['difficulty'],
      };

      let audioUrl: string | undefined;
      try {
        const tts = await fetchTTS({ text: firstQuestion.text });
        audioUrl = base64ToAudioUrl(tts.audioBase64, tts.sampleRate);
      } catch {
        // TTS is optional — continue without audio
      }

      setQuestions([firstQuestion]);
      setCurrentAudioUrl(audioUrl);
      sessionStartRef.current = Date.now();
      questionShownAtRef.current = Date.now();
      setStep('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
      setStep('job-setup');
    } finally {
      setIsProcessing(false);
      setResearchStep(0);
    }
  };

  // Phase 3B: Handle transcription for preview
  const handleTranscribe = async (text: string, audioBlob?: Blob) => {
    if (!questions[currentQuestionIndex]) return;

    if (audioBlob) {
      inputModeRef.current = 'audio';
      setIsProcessing(true);
      try {
        const base64 = await blobToBase64(audioBlob);
        const { text: transcribed } = await fetchTranscription({
          audioBase64: base64,
          mimeType: audioBlob.type || 'audio/webm',
        });
        originalTranscriptionRef.current = transcribed;
        setPreviewText(transcribed);
      } catch (error) {
        console.error('Error transcribing audio:', error);
        toast.error('Failed to transcribe audio. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      inputModeRef.current = 'typed';
      originalTranscriptionRef.current = null;
      setPreviewText(text);
    }
  };

  // Phase 3B: Confirm the previewed answer
  const handleConfirmAnswer = async () => {
    if (!previewText || !questions[currentQuestionIndex] || !researchData) return;

    setIsProcessing(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const feedback = await fetchEvaluation({
        question: currentQuestion.text,
        answer: previewText,
        context: researchData,
        resume: profile?.resume,
      });

      const responseTimeSeconds = questionShownAtRef.current > 0
        ? Math.round((Date.now() - questionShownAtRef.current) / 1000)
        : undefined;

      const inputMode = inputModeRef.current;
      const answerWordCount = previewText.trim().split(/\s+/).filter(Boolean).length;
      const transcriptionEdited = inputMode === 'audio' && originalTranscriptionRef.current !== null
        ? previewText !== originalTranscriptionRef.current
        : undefined;

      const turn: InterviewTurn = {
        question: currentQuestion,
        userAnswer: previewText,
        feedback,
        audioUrl: currentAudioUrl,
        responseTimeSeconds,
        inputMode,
        answerWordCount,
        transcriptionEdited,
      };

      // Track follow-up offers
      if (feedback.followUpQuestion && feedback.score <= 4) {
        followUpsOfferedRef.current++;
      }

      const newHistory = [...history, turn];
      setHistory(newHistory);
      setPreviewText(null);
      markDirty();

      // Phase 3E: Start pre-fetching next question while user reads feedback
      prefetchRef.current = null;
      prefetchNextQuestion(newHistory, researchData);
    } catch (error) {
      console.error('Error processing answer:', error);
      toast.error('Failed to process answer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewText(null);
  };

  // Phase 2C: Handle follow-up question
  const handleFollowUp = async () => {
    const lastTurn = history[history.length - 1];
    if (!lastTurn?.feedback?.followUpQuestion) return;
    followUpsTakenRef.current++;

    setIsProcessing(true);
    try {
      const followUpQuestion: Question = {
        id: `followup-${crypto.randomUUID()}`,
        text: lastTurn.feedback.followUpQuestion,
        type: lastTurn.question.type,
        difficulty: lastTurn.question.difficulty,
      };

      let audioUrl: string | undefined;
      try {
        const tts = await fetchTTS({ text: followUpQuestion.text });
        audioUrl = base64ToAudioUrl(tts.audioBase64, tts.sampleRate);
      } catch {
        // TTS is optional
      }

      setQuestions((prev) => [...prev, followUpQuestion]);
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAudioUrl(audioUrl);
      questionShownAtRef.current = Date.now();
      markDirty();
    } catch (error) {
      console.error('Error generating follow-up:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resume a saved draft
  const handleResumeDraft = async () => {
    if (!draftToResume) return;

    setIsProcessing(true);
    try {
      const draft = draftToResume;
      setJobSetup({ jobDescription: draft.jobDescription, companyName: draft.companyName || '' });
      setResearchData(draft.researchData);
      setQuestions(
        draft.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type as Question['type'],
          difficulty: q.difficulty as Question['difficulty'],
        })),
      );
      setCurrentQuestionIndex(draft.currentQuestionIndex);
      setHistory(
        draft.history.map((h) => ({
          question: {
            id: crypto.randomUUID(),
            text: h.question.text,
            type: h.question.type as Question['type'],
            difficulty: h.question.difficulty as Question['difficulty'],
          },
          userAnswer: h.userAnswer,
          feedback: h.feedback,
          responseTimeSeconds: h.responseTimeSeconds,
          inputMode: h.inputMode,
          answerWordCount: h.answerWordCount,
          transcriptionEdited: h.transcriptionEdited,
        })),
      );
      sessionStartRef.current = draft.sessionStartTimestamp;
      followUpsOfferedRef.current = draft.followUpsOffered;
      followUpsTakenRef.current = draft.followUpsTaken;
      questionShownAtRef.current = Date.now();
      setDraftToResume(null);
      setStep('interview');

      // Generate TTS in background — don't block the interview from loading
      const currentQ = draft.questions[draft.currentQuestionIndex];
      if (currentQ) {
        fetchTTS({ text: currentQ.text })
          .then((tts) => setCurrentAudioUrl(base64ToAudioUrl(tts.audioBase64, tts.sampleRate)))
          .catch(() => setCurrentAudioUrl(undefined));
      }
    } catch (error) {
      console.error('Error resuming draft:', error);
      toast.error('Failed to resume interview. Starting fresh.');
      setDraftToResume(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Discard a saved draft
  const handleDiscardDraft = () => {
    setDraftToResume(null);
    deleteDraft().catch(() => {});
  };

  const handleNextQuestion = async () => {
    if (!researchData) return;

    // Count only non-follow-up questions toward the limit
    const mainQuestionsAsked = questions.filter((q) => !q.id.startsWith('followup-')).length;
    if (mainQuestionsAsked >= MAX_QUESTIONS) {
      setStep('summary');
      return;
    }

    setIsProcessing(true);
    try {
      // Phase 3E: Use prefetched question if available
      if (prefetchRef.current) {
        const { question, audioUrl } = prefetchRef.current;
        prefetchRef.current = null;
        setQuestions((prev) => [...prev, question]);
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentAudioUrl(audioUrl);
        questionShownAtRef.current = Date.now();
        setIsProcessing(false);
        return;
      }

      const nextQuestionData = await fetchQuestion({
        history: serializeHistory(history),
        researchData,
      });
      const nextQuestion: Question = {
        id: crypto.randomUUID(),
        text: nextQuestionData.text,
        type: nextQuestionData.type as Question['type'],
        difficulty: nextQuestionData.difficulty as Question['difficulty'],
      };

      let audioUrl: string | undefined;
      try {
        const tts = await fetchTTS({ text: nextQuestion.text });
        audioUrl = base64ToAudioUrl(tts.audioBase64, tts.sampleRate);
      } catch {
        // TTS is optional
      }

      setQuestions((prev) => [...prev, nextQuestion]);
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAudioUrl(audioUrl);
      questionShownAtRef.current = Date.now();
    } catch (error) {
      console.error('Error generating next question:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = () => {
    setStep('job-setup');
    setJobSetup(null);
    setResearchData(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setHistory([]);
    setCurrentAudioUrl(undefined);
    setPreviewText(null);
    prefetchRef.current = null;
    followUpsOfferedRef.current = 0;
    followUpsTakenRef.current = 0;
    deleteDraft().catch(() => {});
  };

  // Show loading while auth/profile is resolving
  if (profileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Calculate progress for Phase 3A
  const currentMainIndex = questions
    .slice(0, currentQuestionIndex + 1)
    .filter((q) => !q.id.startsWith('followup-')).length;

  // Phase 2C: Check for follow-up availability
  const lastFeedback = history[currentQuestionIndex]?.feedback;
  const hasFollowUp = lastFeedback && lastFeedback.score <= 4 && lastFeedback.followUpQuestion;

  const researchSteps = [
    { icon: Search, label: 'Searching company information...' },
    { icon: FileText, label: 'Analyzing job requirements...' },
    { icon: MessageSquare, label: 'Generating tailored questions...' },
  ];

  return (
    <AnimatePresence mode="wait">
      {step === 'profile-setup' && (
        <ProfileSetup key="profile-setup" />
      )}

      {step === 'job-setup' && !quotaExceeded && (
        <JobSetupForm
          key="job-setup"
          onComplete={handleJobSetupComplete}
          resumeBanner={
            draftToResume ? (
              <ResumeBanner
                draft={draftToResume}
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
                isResuming={isProcessing}
              />
            ) : undefined
          }
        />
      )}

      {quotaExceeded && (
        <motion.div
          key="quota-exceeded"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex-1 flex items-center justify-center px-6"
        >
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Monthly Limit Reached
              </h2>
              <p className="text-neutral-400 text-sm">
                You&apos;ve used all 3 free practice sessions this month.
                Upgrade to Pro for unlimited interviews.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {upgradeLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Upgrade to Pro
              </button>
              <button
                onClick={() => { setQuotaExceeded(false); setStep('job-setup'); }}
                className="w-full py-3 px-4 text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'researching' && (
        <motion.div
          key="researching"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto px-6"
          role="status"
          aria-live="polite"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <Loader2 className="w-12 h-12 animate-spin text-white relative z-10" />
          </div>
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-2xl font-light">
              Preparing Your Interview...
            </h2>
            <p className="text-neutral-500">
              Analyzing job description and preparing tailored interview questions
            </p>
          </div>

          {/* Phase 3C: Animated research steps */}
          <div className="space-y-3 w-full max-w-xs relative z-10 mx-auto">
            {researchSteps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === researchStep;
              const isDone = i < researchStep;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className={`flex items-center justify-center gap-3 text-xs font-mono ${isActive ? 'text-blue-400' : isDone ? 'text-green-400' : 'text-neutral-600'}`}
                >
                  {isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span>{s.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {step === 'interview' && questions[currentQuestionIndex] && (
        <div key="interview" className="flex-1 flex flex-col relative">
          {researchData?.sources && researchData.sources.length > 0 && (
            <div className="absolute top-4 right-6 z-30">
              <div className="group relative">
                <button aria-label="View research sources" className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                  Research Active
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <h4 className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                    Sources Used
                  </h4>
                  <ul className="space-y-2">
                    {researchData.sources.slice(0, 5).map((source, i) => (
                      <li key={i}>
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline block truncate"
                        >
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Interview
            question={questions[currentQuestionIndex]}
            isProcessing={isProcessing}
            onAnswer={handleTranscribe}
            onConfirmAnswer={handleConfirmAnswer}
            onCancelPreview={handleCancelPreview}
            previewText={previewText}
            onPreviewTextChange={setPreviewText}
            feedback={history[currentQuestionIndex]?.feedback || null}
            onNextQuestion={handleNextQuestion}
            onFollowUp={hasFollowUp ? handleFollowUp : undefined}
            audioUrl={currentAudioUrl}
            questionNumber={currentMainIndex}
            totalQuestions={MAX_QUESTIONS}
          />
        </div>
      )}

      {step === 'summary' && (
        <Summary key="summary" history={history} onRestart={handleRestart} />
      )}
    </AnimatePresence>
  );
}
