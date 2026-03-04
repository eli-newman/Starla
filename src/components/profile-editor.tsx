'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, User } from 'lucide-react';
import { saveProfile } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { ResumeInput } from '@/components/resume-input';

export function ProfileEditor() {
  const { profile, profileLoading, refreshProfile } = useAuth();
  const [experience, setExperience] = useState('');
  const [resume, setResume] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setExperience(profile.experience);
      setResume(profile.resume);
    }
  }, [profile]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await saveProfile({ experience, resume: resume || undefined });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-white">
            Edit <span className="text-neutral-500 font-serif italic">Profile</span>
          </h1>
          <p className="text-neutral-400">
            Update your experience level and resume for future interviews.
          </p>
        </div>

        <form
          aria-label="Edit profile"
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
                <option value="" disabled>Select level</option>
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (3-5 years)</option>
                <option value="Senior">Senior (5-8 years)</option>
                <option value="Staff/Principal">Staff/Principal (8+ years)</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <ResumeInput value={resume} onChange={setResume} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!experience || saving}
              className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : saving ? (
                'Saving...'
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
