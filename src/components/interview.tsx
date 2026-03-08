'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Pause, Send, Volume2, Edit3, RotateCcw, Check, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AudioRecorder } from './audio-recorder';
import type { Question, Feedback } from '@/types';
import { ShareScoreModal } from './share-score-card';

interface InterviewProps {
  question: Question;
  isProcessing: boolean;
  onAnswer: (text: string, audioBlob?: Blob) => void;
  onConfirmAnswer: () => void;
  onCancelPreview: () => void;
  previewText: string | null;
  onPreviewTextChange: (text: string) => void;
  feedback: Feedback | null;
  onNextQuestion: () => void;
  onFollowUp?: () => void;
  audioUrl?: string;
  questionNumber: number;
  totalQuestions: number;
}

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400 border-green-400/30',
  medium: 'text-yellow-400 border-yellow-400/30',
  hard: 'text-red-400 border-red-400/30',
};

export function Interview({
  question,
  isProcessing,
  onAnswer,
  onConfirmAnswer,
  onCancelPreview,
  previewText,
  onPreviewTextChange,
  feedback,
  onNextQuestion,
  onFollowUp,
  audioUrl,
  questionNumber,
  totalQuestions,
}: InterviewProps) {
  const [answerText, setAnswerText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch((e) => console.log('Auto-play prevented:', e));
      setIsPlaying(true);
    }
    setAnswerText('');
  }, [question.id, audioUrl]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTextSubmit = () => {
    if (!answerText.trim()) return;
    onAnswer(answerText);
  };

  const handleAudioSubmit = (blob: Blob) => {
    onAnswer('', blob);
  };

  const isFollowUp = question.id.startsWith('followup-');
  const progressPercent = totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 h-full flex flex-col">
      {/* Phase 3A: Progress indicator */}
      {!isFollowUp && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
            <span>Question {questionNumber} of {totalQuestions}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center space-y-8 min-h-[40vh]">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 uppercase tracking-wider">
              {isFollowUp ? 'Follow-Up' : question.type} Question
            </span>
            {question.difficulty && (
              <span className={`px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider ${difficultyColors[question.difficulty] || 'text-neutral-400 border-neutral-800'}`}>
                {question.difficulty}
              </span>
            )}
            {audioUrl && (
              <button
                onClick={toggleAudio}
                aria-label={isPlaying ? 'Pause question audio' : 'Play question audio'}
                className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-light leading-tight">
            {question.text}
          </h2>
        </motion.div>

        {/* Phase 3B: Answer preview */}
        <AnimatePresence>
          {previewText !== null && !feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider">Review Your Answer</h3>
              </div>
              <textarea
                value={previewText}
                onChange={(e) => onPreviewTextChange(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none min-h-[120px] text-sm leading-relaxed"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onCancelPreview}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-record
                </button>
                <button
                  onClick={onConfirmAnswer}
                  disabled={isProcessing || !previewText.trim()}
                  className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span role="status">
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                      Evaluating...
                    </span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Feedback</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Score</span>
                  <span className="text-xl font-bold text-white">{feedback.score}/10</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="text-green-400 font-mono text-xs uppercase mb-2">Strengths</h4>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-400 font-mono text-xs uppercase mb-2">Improvements</h4>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    {feedback.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <h4 className="text-blue-400 font-mono text-xs uppercase mb-2">Better Answer</h4>
                <div className="text-neutral-300 italic prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{feedback.betterAnswer}</ReactMarkdown>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShareOpen(true)}
                  className="px-5 py-2 rounded-full text-sm font-medium border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Score
                </button>
                {onFollowUp && (
                  <button
                    onClick={onFollowUp}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-full text-sm font-medium border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    Follow-Up Question
                  </button>
                )}
                <button
                  onClick={onNextQuestion}
                  disabled={isProcessing}
                  className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span role="status">
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                      Generating...
                    </span>
                  ) : (
                    'Next Question'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {feedback && shareOpen && (
        <ShareScoreModal
          score={feedback.score}
          strengths={feedback.strengths}
          questionType={question.type}
          questionNumber={questionNumber}
          onClose={() => setShareOpen(false)}
        />
      )}

      {!feedback && previewText === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto pt-8 border-t border-neutral-900"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
              <p className="text-neutral-500 font-mono text-sm">Transcribing your response...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 pr-12 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTextSubmit();
                      }
                    }}
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!answerText.trim()}
                    aria-label="Submit answer"
                    className="absolute right-3 bottom-3 p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-neutral-900 flex-1" />
                <span className="text-xs text-neutral-600 font-mono uppercase">Or speak</span>
                <div className="h-px bg-neutral-900 flex-1" />
              </div>

              <AudioRecorder onRecordingComplete={handleAudioSubmit} isProcessing={isProcessing} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
