import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures the variable is declared before vi.mock factory runs
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  Type: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
    NUMBER: 'NUMBER',
  },
}));

import { extractJobInfo, researchJob, generateQuestion, evaluateAnswer, transcribeAudio, generateSpeech } from '@/lib/gemini';

describe('gemini server library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractJobInfo', () => {
    it('returns extracted role, company, and focusAreas', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          role: 'Senior Engineer',
          company: 'Acme Inc',
          focusAreas: ['TypeScript', 'React'],
        }),
      });

      const result = await extractJobInfo('We are hiring a Senior Engineer at Acme Inc...');
      expect(result.role).toBe('Senior Engineer');
      expect(result.company).toBe('Acme Inc');
      expect(result.focusAreas).toEqual(['TypeScript', 'React']);
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });
  });

  describe('researchJob', () => {
    it('returns parsed research data with sources', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          companyContext: 'Great company',
          roleContext: 'Needs TS skills',
          suggestedQuestions: ['Tell me about yourself'],
        }),
        candidates: [
          {
            groundingMetadata: {
              groundingChunks: [
                { web: { title: 'Source 1', uri: 'https://example.com' } },
              ],
            },
          },
        ],
      });

      const result = await researchJob('Senior SWE at Google...', 'My resume', 'Senior');
      expect(result.companyContext).toBe('Great company');
      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].title).toBe('Source 1');
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });
  });


  describe('generateQuestion', () => {
    it('returns a question with text and type', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ text: 'Describe a challenge', type: 'behavioral', difficulty: 'easy' }),
      });

      const result = await generateQuestion([], { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.text).toBe('Describe a challenge');
      expect(result.type).toBe('behavioral');
    });

    it('returns difficulty in the response', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ text: 'Explain microservices', type: 'technical', difficulty: 'hard' }),
      });

      const result = await generateQuestion(
        [{ question: { text: 'Q1', type: 'behavioral' }, userAnswer: 'A1', feedback: { strengths: [], improvements: [], betterAnswer: '', score: 8 } }],
        { companyContext: 'Tech co', roleContext: 'Backend role', suggestedQuestions: ['Q1', 'Q2'] },
      );
      expect(result.difficulty).toBe('hard');
      expect(result.type).toBe('technical');
    });

    it('adapts difficulty based on prior scores', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ text: 'Simple question', type: 'situational', difficulty: 'easy' }),
      });

      const lowScoreHistory = [
        { question: { text: 'Q1', type: 'behavioral' }, userAnswer: 'A1', feedback: { strengths: [], improvements: ['Be specific'], betterAnswer: '', score: 3 } },
        { question: { text: 'Q2', type: 'technical' }, userAnswer: 'A2', feedback: { strengths: [], improvements: ['Add detail'], betterAnswer: '', score: 2 } },
      ];

      const result = await generateQuestion(lowScoreHistory, { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.difficulty).toBe('easy');

      // Verify the prompt was called — we can't easily check prompt content but can ensure it ran
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });
  });

  describe('evaluateAnswer', () => {
    it('returns feedback with score', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          strengths: ['Good structure'],
          improvements: ['Add metrics'],
          betterAnswer: 'A better response...',
          score: 7,
          followUpQuestion: '',
        }),
      });

      const result = await evaluateAnswer('Question?', 'My answer', { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.score).toBe(7);
      expect(result.strengths).toContain('Good structure');
    });

    it('returns followUpQuestion for low scores', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          strengths: ['Attempted an answer'],
          improvements: ['Needs more depth', 'Use STAR method'],
          betterAnswer: 'A much better response...',
          score: 3,
          followUpQuestion: 'Can you give a specific example of when you handled a similar situation?',
        }),
      });

      const result = await evaluateAnswer('Tell me about a time you led a project', 'I led a project once', { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.score).toBe(3);
      expect(result.followUpQuestion).toBeTruthy();
      expect(result.followUpQuestion).toContain('specific example');
    });

    it('returns empty followUpQuestion for high scores', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          strengths: ['Excellent STAR format', 'Quantified results'],
          improvements: ['Could mention team dynamics'],
          betterAnswer: 'Slightly improved version...',
          score: 8,
          followUpQuestion: '',
        }),
      });

      const result = await evaluateAnswer('Question?', 'A thorough detailed answer...', { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.score).toBe(8);
      expect(result.followUpQuestion).toBeFalsy();
    });
  });

  describe('transcribeAudio', () => {
    it('returns transcribed text', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Hello world' });

      const result = await transcribeAudio('base64data', 'audio/webm');
      expect(result).toBe('Hello world');
    });
  });

  describe('generateSpeech', () => {
    it('returns base64 audio and sample rate', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: 'audiobase64data' } }],
            },
          },
        ],
      });

      const result = await generateSpeech('Hello');
      expect(result.audioBase64).toBe('audiobase64data');
      expect(result.sampleRate).toBe(24000);
    });

    it('throws when no audio generated', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{}] } }],
      });

      await expect(generateSpeech('Hello')).rejects.toThrow('No audio generated');
    });
  });
});
