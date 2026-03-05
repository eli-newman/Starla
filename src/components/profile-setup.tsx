'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { saveProfile } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { ResumeInput } from '@/components/resume-input';

export function ProfileSetup() {
  const { refreshProfile } = useAuth();
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await saveProfile({ experience, resume: resume || undefined });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
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
            Welcome to Star<span className="text-neutral-500 font-serif italic">la</span>
          </h1>
          <p className="text-neutral-400">
            Set up your profile once — we&apos;ll use it for every interview practice session.
          </p>
        </div>

        <form
          aria-label="Profile setup"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="experience-select"
              className="text-xs font-mono text-neutral-500 uppercase tracking-wider"
            >
              Experience Level
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
              <select
                id="experience-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all appearance-none"
              >
                <option value="" disabled>
                  Select level
                </option>
                <option value="Student (Freshman/Sophomore)">Student (Freshman/Sophomore)</option>
                <option value="Student (Junior/Senior)">Student (Junior/Senior)</option>
                <option value="Recent Graduate">Recent Graduate (0-1 year)</option>
                <option value="Early Career">Early Career (1-3 years)</option>
                <option value="Mid Career+">Mid Career+ (3+ years)</option>
              </select>
            </div>
          </div>

          <ResumeInput
            value={resume}
            onChange={setResume}
            ariaDescribedBy="resume-hint"
          />
          <p id="resume-hint" className="sr-only">
            Upload a PDF resume or paste your resume text
          </p>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!experience || saving}
              className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
