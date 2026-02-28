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

import { researchRole, generateQuestion, evaluateAnswer, transcribeAudio, generateSpeech } from '@/lib/gemini';

describe('gemini server library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('researchRole', () => {
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

      const result = await researchRole('SWE', 'Google', 'My resume', 'System Design');
      expect(result.companyContext).toBe('Great company');
      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].title).toBe('Source 1');
      expect(mockGenerateContent).toHaveBeenCalledOnce();
    });
  });

  describe('generateQuestion', () => {
    it('returns a question with text and type', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ text: 'Describe a challenge', type: 'behavioral' }),
      });

      const result = await generateQuestion([], { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.text).toBe('Describe a challenge');
      expect(result.type).toBe('behavioral');
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
        }),
      });

      const result = await evaluateAnswer('Question?', 'My answer', { companyContext: '', roleContext: '', suggestedQuestions: [] });
      expect(result.score).toBe(7);
      expect(result.strengths).toContain('Good structure');
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
