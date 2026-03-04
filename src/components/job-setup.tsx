'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, FileText, Building2 } from 'lucide-react';
import type { JobSetup } from '@/types';

interface JobSetupProps {
  onComplete: (data: JobSetup) => void;
  resumeBanner?: ReactNode;
}

export function JobSetupForm({ onComplete, resumeBanner }: JobSetupProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = () => {
    onComplete({ jobDescription, companyName: companyName.trim() });
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
            Paste the job description and we&apos;ll tailor the interview to the role.
          </p>
        </div>

        {resumeBanner}

        <form
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!jobDescription.trim()}
              className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
