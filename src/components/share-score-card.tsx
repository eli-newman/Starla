'use client';

import { useRef, useState } from 'react';
import { X, Copy, Download, Share2, Check } from 'lucide-react';

interface ShareScoreCardProps {
  score: number;
  strengths: string[];
  questionType: string;
  questionNumber: number;
}

interface ShareScoreModalProps extends ShareScoreCardProps {
  onClose: () => void;
}

function ShareScoreCard({ score, strengths, questionType, questionNumber }: ShareScoreCardProps) {
  const topStrengths = strengths.slice(0, 2);

  return (
    <div className="w-[360px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800">
      {/* Gradient top accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="p-8 space-y-6">
        {/* Branding */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-light tracking-tight text-white">
            Star<span className="text-purple-400">la</span>
          </div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            AI Interview Coach
          </span>
        </div>

        {/* Score */}
        <div className="text-center py-4">
          <div className="text-6xl font-bold text-white tracking-tight">
            {score}<span className="text-2xl font-light text-neutral-500"> / 10</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-sm font-mono text-neutral-400 uppercase tracking-wider">
              {questionType}
            </span>
            <span className="text-neutral-600 text-sm">Q{questionNumber}</span>
          </div>
        </div>

        {/* Strengths */}
        {topStrengths.length > 0 && (
          <div className="space-y-2">
            {topStrengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-neutral-300 line-clamp-1">{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 border-t border-neutral-800">
          <p className="text-center text-xs text-neutral-600 font-mono">
            trystarla.com
          </p>
        </div>
      </div>
    </div>
  );
}

export function ShareScoreModal({
  score,
  strengths,
  questionType,
  questionNumber,
  onClose,
}: ShareScoreModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloaded'>('idle');

  const topStrengths = strengths.slice(0, 2);

  const shareText = [
    `I scored ${score}/10 on a ${questionType} interview question on Starla!`,
    ...topStrengths.map((s) => `✓ ${s}`),
    'Practice at trystarla.com',
  ].join('\n');

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `starla-score-q${questionNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadStatus('downloaded');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'My Starla Interview Score',
        text: shareText,
        url: 'https://trystarla.com',
      });
    } catch {
      // User cancelled share — that's fine
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 max-w-md w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Share Your Score</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card preview */}
        <div className="flex justify-center">
          <div ref={cardRef}>
            <ShareScoreCard
              score={score}
              strengths={strengths}
              questionType={questionType}
              questionNumber={questionNumber}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Text
              </>
            )}
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            {downloadStatus === 'downloaded' ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
