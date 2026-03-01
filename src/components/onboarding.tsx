'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, Building, FileText, Target, User } from 'lucide-react';
import type { UserProfile } from '@/types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    role: '',
    company: '',
    experience: '',
    resume: '',
    focusAreas: '',
  });

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(formData);
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
            Let&apos;s set up your <span className="text-neutral-500 font-serif italic">interview</span>
          </h1>
          <p className="text-neutral-400">
            Tell me about the role you&apos;re targeting so I can research it.
          </p>
        </div>

        <form aria-label="Interview setup" onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              aria-current="step"
            >
              <div className="space-y-2">
                <label htmlFor="role-input" className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Target Role</label>
                <p id="role-hint" className="sr-only">Enter the job title you are targeting, for example Senior Product Designer</p>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <input
                    id="role-input"
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                    aria-describedby="role-hint"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="company-input" className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Target Company</label>
                <p id="company-hint" className="sr-only">Enter the company name, for example Google, Airbnb, or Stripe</p>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <input
                    id="company-input"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="e.g. Google, Airbnb, Stripe"
                    aria-describedby="company-hint"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              aria-current="step"
            >
              <div className="space-y-2">
                <label htmlFor="experience-select" className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Experience Level</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <select
                    id="experience-select"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
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

              <div className="space-y-2">
                <label htmlFor="focus-input" className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Focus Areas</label>
                <p id="focus-hint" className="sr-only">Enter your interview focus areas, for example System Design, Behavioral, or Leadership</p>
                <div className="relative">
                  <Target className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <input
                    id="focus-input"
                    type="text"
                    value={formData.focusAreas}
                    onChange={(e) => handleChange('focusAreas', e.target.value)}
                    placeholder="e.g. System Design, Behavioral, Leadership"
                    aria-describedby="focus-hint"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
              aria-current="step"
            >
              <div className="space-y-2">
                <label htmlFor="resume-textarea" className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Resume / Background</label>
                <p id="resume-hint" className="sr-only">Paste your resume text or a brief bio describing your background</p>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" aria-hidden="true" />
                  <textarea
                    id="resume-textarea"
                    value={formData.resume}
                    onChange={(e) => handleChange('resume', e.target.value)}
                    placeholder="Paste your resume text or a brief bio here..."
                    aria-describedby="resume-hint"
                    className="w-full h-48 bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-neutral-500 hover:text-white transition-colors px-4 py-2"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.role || !formData.company)) ||
                (step === 2 && !formData.experience)
              }
              className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Start Interview' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
