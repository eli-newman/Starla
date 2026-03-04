import type { ResearchData } from '@/types';

export function createBehavioralResearchData(): ResearchData {
  return {
    role: 'General Interview Practice',
    company: '',
    companyContext:
      'General behavioral interview practice session. Focus on the candidate\'s experiences, decision-making, and interpersonal skills.',
    roleContext:
      'This is a general behavioral interview covering leadership, teamwork, problem-solving, conflict resolution, adaptability, and communication.',
    suggestedQuestions: [
      // Leadership
      'Tell me about a time you led a team through a challenging project. What was your approach?',
      'Describe a situation where you had to make a tough decision with limited information.',
      'Give an example of a time you took initiative on something outside your usual responsibilities.',
      // Teamwork
      'Tell me about a time you collaborated with people from different teams or departments.',
      'Describe a disagreement you had with a coworker. How did you resolve it?',
      // Problem-solving
      'Tell me about a significant obstacle you overcame at work. What was your process?',
      'Describe a time you had to deliver results under tight pressure or a deadline.',
      'Give an example of a situation where you had to work with ambiguous requirements.',
      // Adaptability
      'Tell me about a time you had to pivot your strategy or approach midway through a project.',
      'Describe a failure or mistake you made. What did you learn from it?',
      'Give an example of how you adapted to a major change at work.',
      // Communication
      'Tell me about a time you had to persuade someone to see things your way.',
      'Describe a situation where you had to deliver bad news. How did you handle it?',
      'Give an example of a difficult conversation you navigated successfully.',
    ],
  };
}
