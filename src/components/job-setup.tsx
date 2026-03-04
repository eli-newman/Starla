'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, FileText, Building2, Crosshair, Users } from 'lucide-react';
import type { JobSetup } from '@/types';

interface JobSetupProps {
  onComplete: (data: JobSetup) => void;
  resumeBanner?: ReactNode;
}

export function JobSetupForm({ onComplete, resumeBanner }: JobSetupProps) {
  const [mode, setMode] = useState<'targeted' | 'general' | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = () => {
    onComplete({ jobDescription, companyName: companyName.trim(), mode: 'targeted' });
  };

  const handleStartGeneral = () => {
    onComplete({ jobDescription: '', companyName: '', mode: 'general' });
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-white">
            Set up your <span className="text-neutral-500 font-serif italic">interview</span>
          </h1>
          <p className="text-neutral-400">
            {mode === null
              ? 'Choose your interview style to get started.'
              : mode === 'targeted'
                ? 'Paste the job description and we\u2019ll tailor the interview to the role.'
                : 'Practice classic behavioral questions \u2014 no job description needed.'}
          </p>
        </div>

        {resumeBanner}

        <AnimatePresence mode="wait">
          {mode === null && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <button
                type="button"
                onClick={() => setMode('targeted')}
                className="group flex flex-col items-start gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-neutral-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Crosshair className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-medium">Targeted Interview</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Paste a job description and we&apos;ll tailor questions to the role.
                  </p>
                </div>
                <span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors flex items-center gap-1 mt-auto">
                  Select <ArrowRight className="w-3 h-3" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode('general')}
                className="group flex flex-col items-start gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-left hover:border-neutral-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-medium">General Interview</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Practice classic behavioral questions: leadership, teamwork, problem-solving.
                  </p>
                </div>
                <span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors flex items-center gap-1 mt-auto">
                  Select <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </motion.div>
          )}

          {mode === 'targeted' && (
            <motion.form
              key="targeted-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              aria-label="Job setup"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="company-input"
                  className="text-xs font-mono text-neutral-500 uppercase tracking-wider"
                >
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <input
                    id="company-input"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Stripe, Acme Corp"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jd-textarea"
                  className="text-xs font-mono text-neutral-500 uppercase tracking-wider"
                >
                  Job Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <textarea
                    id="jd-textarea"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-56 bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-neutral-500 hover:text-white px-4 py-3 flex items-center gap-2 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!jobDescription.trim()}
                  className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'general' && (
            <motion.div
              key="general-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-white font-medium">What to expect</h3>
                <ul className="text-neutral-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">&#8226;</span>
                    Classic behavioral questions used in real interviews
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">&#8226;</span>
                    Covers leadership, teamwork, problem-solving, adaptability
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">&#8226;</span>
                    No job description needed &mdash; just jump in
                  </li>
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="text-neutral-500 hover:text-white px-4 py-3 flex items-center gap-2 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartGeneral}
                  className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors"
                >
                  Start Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
