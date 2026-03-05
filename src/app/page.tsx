'use client';

import { motion } from 'motion/react';
import {
  Sparkles,
  MessageSquare,
  BarChart3,
  FileText,
  Mic,
  Target,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  GraduationCap,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-4xl space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 text-neutral-400 text-sm">
          <Sparkles className="w-4 h-4" />
          AI-powered interview preparation
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.05]">
          Nail every
          <br />
          interview with{' '}
          <span className="relative">
            Star<span className="text-neutral-500 font-serif italic">la</span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-500 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </span>
        </h1>

        <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Practice real interview questions, get instant feedback,
          and walk in confident — even if it&apos;s your first interview.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="group bg-white text-black px-8 py-4 rounded-2xl font-medium flex items-center gap-3 hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
          >
            Start practicing free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="text-neutral-500 hover:text-white transition-colors px-8 py-4 flex items-center gap-2"
          >
            See how it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-5 h-5 text-neutral-700" />
      </motion.div>
    </section>
  );
}

/* ─── How It Works ─── */
const steps = [
  {
    icon: FileText,
    title: 'Upload your resume',
    description:
      'Drop in your resume and tell us the role. Starla instantly understands your background.',
  },
  {
    icon: Target,
    title: 'We research the company',
    description:
      'Starla pulls real data about the company, role, and common interview questions.',
  },
  {
    icon: Mic,
    title: 'Practice the interview',
    description:
      'Answer behavioral and technical questions in a realistic, conversational format.',
  },
  {
    icon: BarChart3,
    title: 'Get detailed feedback',
    description:
      'Receive scores, strengths, improvements, and a full performance breakdown after each session.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            Four steps to interview confidence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="p-8 rounded-3xl border border-neutral-900 bg-neutral-950 hover:border-neutral-800 transition-colors h-full">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 group-hover:bg-neutral-800 transition-colors">
                  <step.icon className="w-6 h-6 text-neutral-400" />
                </div>
                <div className="text-neutral-600 text-sm font-mono mb-3">
                  0{i + 1}
                </div>
                <h3 className="text-white text-lg font-medium mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const features = [
  {
    icon: MessageSquare,
    title: 'Real interview questions',
    description:
      'Behavioral, technical, and situational questions tailored to your target role and company.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered feedback',
    description:
      'Get scored on clarity, relevance, depth, and structure with specific suggestions to improve.',
  },
  {
    icon: BarChart3,
    title: 'Performance analytics',
    description:
      'Track your progress across sessions. See trends in your scores and identify weak spots.',
  },
  {
    icon: FileText,
    title: 'Resume-aware coaching',
    description:
      'Upload your resume and Starla weaves your actual experience into practice questions.',
  },
  {
    icon: Target,
    title: 'Company research',
    description:
      'Starla researches the company before each session so questions feel real and relevant.',
  },
  {
    icon: Mic,
    title: 'Conversational practice',
    description:
      'Back-and-forth dialogue that mirrors real interviews — not just Q&A flashcards.',
  },
];

function Features() {
  return (
    <section className="py-32 px-6 border-t border-neutral-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            Everything you need to prepare
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-3xl border border-neutral-900 hover:border-neutral-800 transition-colors group"
            >
              <feature.icon className="w-6 h-6 text-neutral-500 mb-4 group-hover:text-neutral-300 transition-colors" />
              <h3 className="text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
const plans = [
  {
    name: 'Free',
    icon: User,
    price: '$0',
    period: 'forever',
    description: 'Try it out — no commitment',
    features: [
      '3 practice sessions per month',
      'Basic feedback & scoring',
      'Company research',
      'Session history',
    ],
    cta: 'Start practicing',
    href: '/login',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    price: '$12',
    period: '/month',
    description: 'For interview season',
    features: [
      'Unlimited practice sessions',
      'Advanced feedback & analytics',
      'Resume-aware questions',
      'Performance trends & insights',
      'Priority AI processing',
      'Export session reports',
    ],
    cta: 'Start free trial',
    href: '/login',
    highlighted: true,
  },
  {
    name: 'Career Center',
    icon: GraduationCap,
    price: 'Custom',
    period: '',
    description: 'For university career centers',
    features: [
      'Unlimited seats for students',
      'Admin dashboard & usage analytics',
      'LMS & SSO integration',
      'Dedicated support & onboarding',
      'Custom branding options',
      'Campus-wide reporting',
    ],
    cta: 'Contact us',
    href: 'mailto:eli@starla-ai.com',
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            Simple, transparent pricing
          </h2>
          <p className="text-neutral-500 mt-4 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready to get serious about your
            interview prep.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-neutral-700 bg-neutral-900/50 shadow-2xl shadow-white/5'
                  : 'border-neutral-900 bg-neutral-950'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-xs font-medium">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.highlighted ? 'bg-neutral-800' : 'bg-neutral-900'
                    }`}
                  >
                    <plan.icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-white font-medium text-lg">
                    {plan.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-neutral-500 text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-sm mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-neutral-400"
                  >
                    <Check className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl font-medium text-center text-sm transition-all ${
                  plan.highlighted
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials / Social Proof ─── */
function SocialProof() {
  return (
    <section className="py-32 px-6 border-t border-neutral-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest">
            Trusted by students everywhere
          </p>
          <blockquote className="text-2xl sm:text-3xl font-light text-white leading-relaxed">
            &ldquo;I had my first real interview in a week and was
            freaking out. Starla helped me practice every night — the
            feedback was so specific I actually felt ready walking in.&rdquo;
          </blockquote>
          <div className="text-neutral-500 text-sm">
            <span className="text-neutral-300">Jordan M.</span> — CS Senior,
            landed internship at Stripe
          </div>

          <div className="flex items-center justify-center gap-12 pt-8">
            {[
              { stat: '10,000+', label: 'Practice sessions' },
              { stat: '92%', label: 'Report improvement' },
              { stat: '4.9/5', label: 'User rating' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-2xl font-light text-white">
                  {item.stat}
                </div>
                <div className="text-neutral-600 text-xs font-mono uppercase tracking-wider mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  {
    q: 'How does Starla generate interview questions?',
    a: 'Starla uses AI to research the company and role you\'re targeting, then generates realistic behavioral, technical, and situational questions based on real interview patterns for that position.',
  },
  {
    q: 'Do I need to upload my resume?',
    a: 'It\'s optional but recommended. When you upload your resume, Starla can tailor questions to your specific experience and help you craft better answers using your real background.',
  },
  {
    q: 'What types of interviews can I practice?',
    a: 'Starla covers behavioral (STAR method), technical, situational, and competency-based interviews. You can specify the role and company to get the most relevant question types.',
  },
  {
    q: 'How is the feedback generated?',
    a: 'After each response, Starla evaluates your answer on clarity, relevance, depth, and structure. You get a score, specific strengths, and actionable improvements for each question.',
  },
  {
    q: 'Can I use Starla for free?',
    a: 'Yes! The free plan includes 3 practice sessions per month with basic feedback and company research. Upgrade to Pro for unlimited sessions and advanced analytics.',
  },
  {
    q: 'I\'ve never had a real interview — is Starla right for me?',
    a: 'Absolutely. Most of our users are students practicing for their first interviews. Starla walks you through realistic questions, scores your answers, and tells you exactly what to improve — so you build confidence before the real thing.',
  },
  {
    q: 'What does the Career Center plan include?',
    a: 'The Career Center plan gives universities unlimited access for all enrolled students, an admin dashboard with usage analytics, LMS integration, and dedicated support for campus-wide deployment.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use Firebase Authentication for secure sign-in, and your interview data is encrypted and stored securely. We never share your data with third parties.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6 border-t border-neutral-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest mb-4">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            Common questions
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border border-neutral-900 hover:border-neutral-800 transition-colors text-left group"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="w-5 h-5 text-neutral-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-600 shrink-0" />
                )}
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: open === i ? 'auto' : 0,
                  opacity: open === i ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 pt-2 text-neutral-400 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-32 px-6 border-t border-neutral-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white">
            Ready to ace your next interview?
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Join thousands of students using Starla to practice smarter and
            land offers faster.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
          >
            Get started for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Flickering Star ─── */
function FlickerStar({ size, delay, className }: { size: number; delay: number; className?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-neutral-700 ${className ?? ''}`}
      animate={{ opacity: [0.2, 0.8, 0.3, 1, 0.2] }}
      transition={{ duration: 2 + delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
    </motion.svg>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-neutral-900">
      {/* Big Starla text */}
      <div className="overflow-hidden py-16 sm:py-24">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Left stars */}
          <div className="flex flex-col items-center gap-3">
            <FlickerStar size={14} delay={0.3} />
            <FlickerStar size={8} delay={1.1} className="ml-4" />
            <FlickerStar size={11} delay={0.7} />
          </div>

          <div className="text-[clamp(6rem,20vw,16rem)] font-light tracking-tighter text-neutral-900 leading-none select-none whitespace-nowrap">
            Star<span className="font-serif italic">la</span>
          </div>

          {/* Right stars */}
          <div className="flex flex-col items-center gap-3">
            <FlickerStar size={11} delay={0.9} />
            <FlickerStar size={8} delay={0.2} className="mr-4" />
            <FlickerStar size={14} delay={1.4} />
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-neutral-900 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-neutral-600 text-sm">
            &copy; {new Date().getFullYear()} Starla. All rights reserved.
          </div>
          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            <a href="#how-it-works" className="hover:text-neutral-300 transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-neutral-300 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-neutral-300 transition-colors">
              FAQ
            </a>
            <a href="mailto:eli@starla-ai.com" className="hover:text-neutral-300 transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-neutral-950/70 backdrop-blur-xl border border-neutral-900 rounded-2xl px-6 py-3">
        <span className="text-xl font-light tracking-tight text-white">
          Star<span className="text-neutral-500 font-serif italic">la</span>
        </span>

        <nav className="hidden sm:flex items-center gap-8 text-sm text-neutral-500">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <Link
          href="/login"
          className="bg-white text-black px-5 py-2 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </motion.header>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <SocialProof />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
