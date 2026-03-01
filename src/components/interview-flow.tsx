'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Onboarding } from './onboarding';
import { Interview } from './interview';
import { Summary } from './summary';
import {
  fetchResearch,
  fetchQuestion,
  fetchEvaluation,
  fetchTranscription,
  fetchTTS,
  blobToBase64,
  base64ToAudioUrl,
  saveSession,
} from '@/lib/api-client';
import type { UserProfile, ResearchData, Question, InterviewTurn, InterviewStep } from '@/types';

export function InterviewFlow() {
  const [step, setStep] = useState<InterviewStep>('onboarding');
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [history, setHistory] = useState<InterviewTurn[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);

  // Save to DB when summary is reached
  useEffect(() => {
    if (step === 'summary' && history.length > 0 && profile) {
      const overallScore = Math.round(
        history.reduce((acc, turn) => acc + (turn.feedback?.score || 0), 0) / history.length,
      );
      saveSession({
        profile,
        history: history.map((h) => ({
          question: { text: h.question.text, type: h.question.type },
          userAnswer: h.userAnswer,
          feedback: h.feedback,
        })),
        overallScore,
      }).catch(console.error);
    }
  }, [step, history, profile]);

  const handleOnboardingComplete = async (data: UserProfile) => {
    setProfile(data);
    setStep('researching');
    setIsProcessing(true);

    try {
      const research = await fetchResearch({
        role: data.role,
        company: data.company,
        resume: data.resume,
        focusAreas: data.focusAreas,
      });
      setResearchData(research);

      const firstQuestionData = await fetchQuestion({ history: [], researchData: research });
      const firstQuestion: Question = {
        id: crypto.randomUUID(),
        text: firstQuestionData.text,
        type: firstQuestionData.type as Question['type'],
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
      setStep('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
      setStep('onboarding');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswer = async (text: string, audioBlob?: Blob) => {
    if (!questions[currentQuestionIndex] || !researchData) return;

    setIsProcessing(true);
    try {
      let finalAnswer = text;

      if (audioBlob) {
        const base64 = await blobToBase64(audioBlob);
        const { text: transcribed } = await fetchTranscription({
          audioBase64: base64,
          mimeType: audioBlob.type || 'audio/webm',
        });
        finalAnswer = transcribed;
      }

      const currentQuestion = questions[currentQuestionIndex];
      const feedback = await fetchEvaluation({
        question: currentQuestion.text,
        answer: finalAnswer,
        context: researchData,
      });

      const turn: InterviewTurn = {
        question: currentQuestion,
        userAnswer: finalAnswer,
        feedback,
        audioUrl: currentAudioUrl,
      };

      setHistory((prev) => [...prev, turn]);
    } catch (error) {
      console.error('Error processing answer:', error);
      alert('Failed to process answer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!researchData) return;

    if (questions.length >= 5) {
      setStep('summary');
      return;
    }

    setIsProcessing(true);
    try {
      const serializedHistory = history.map((h) => ({
        question: { text: h.question.text, type: h.question.type },
        userAnswer: h.userAnswer,
        feedback: h.feedback,
      }));

      const nextQuestionData = await fetchQuestion({
        history: serializedHistory,
        researchData,
      });
      const nextQuestion: Question = {
        id: crypto.randomUUID(),
        text: nextQuestionData.text,
        type: nextQuestionData.type as Question['type'],
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
    } catch (error) {
      console.error('Error generating next question:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = () => {
    setStep('onboarding');
    setProfile(null);
    setResearchData(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setHistory([]);
    setCurrentAudioUrl(undefined);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'onboarding' && (
        <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
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
            <h2 className="text-2xl font-light">Researching Role...</h2>
            <p className="text-neutral-500">
              Analyzing {profile?.company} and {profile?.role} requirements
            </p>
          </div>
          <div className="text-xs text-neutral-600 font-mono text-center max-w-xs">
            Using Google Search to find latest company news, interview patterns, and role
            expectations.
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
            onAnswer={handleAnswer}
            feedback={history[currentQuestionIndex]?.feedback || null}
            onNextQuestion={handleNextQuestion}
            audioUrl={currentAudioUrl}
          />
        </div>
      )}

      {step === 'summary' && (
        <Summary key="summary" history={history} onRestart={handleRestart} />
      )}
    </AnimatePresence>
  );
}
