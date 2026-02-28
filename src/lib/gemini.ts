import { GoogleGenAI, Type } from '@google/genai';
import { SerializedInterviewTurn, ResearchData } from '@/types';

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _ai;
}

const MODEL_RESEARCH = 'gemini-3-flash-preview';
const MODEL_REASONING = 'gemini-3.1-pro-preview';
const MODEL_AUDIO = 'gemini-3-flash-preview';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export async function researchRole(
  role: string,
  company: string,
  resume: string,
  focusAreas: string,
) {
  const prompt = `
    Analyze the role of "${role}" at "${company}".
    Consider the user's resume: "${resume.slice(0, 1000)}...".
    Focus areas: "${focusAreas}".

    Provide a JSON object with:
    - companyContext: Key recent news, culture, or mission of ${company}.
    - roleContext: Key skills and responsibilities for ${role}.
    - suggestedQuestions: A list of 5 interview questions (mix of behavioral, technical, situational).
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_RESEARCH,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyContext: { type: Type.STRING },
          roleContext: { type: Type.STRING },
          suggestedQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  });

  const result = JSON.parse(response.text || '{}');

  const sources =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk) =>
        chunk.web ? { title: chunk.web.title || '', uri: chunk.web.uri || '' } : null,
      )
      .filter(Boolean) || [];

  return { ...result, sources };
}

export async function generateQuestion(history: SerializedInterviewTurn[], researchData: ResearchData) {
  const prompt = `
    You are an expert interview coach.
    Context: ${JSON.stringify(researchData)}
    History: ${JSON.stringify(history)}

    Generate the next interview question.
    Return JSON: { "text": "...", "type": "behavioral|technical|situational" }
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_REASONING,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: ['behavioral', 'technical', 'situational'],
          },
        },
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  context: ResearchData,
) {
  const prompt = `
    Question: "${question}"
    User Answer: "${answer}"
    Context: ${JSON.stringify(context)}

    Evaluate the answer. Provide JSON:
    - strengths: list of strings
    - improvements: list of strings
    - betterAnswer: string (a model answer)
    - score: number (1-10)
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_REASONING,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          betterAnswer: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function transcribeAudio(base64: string, mimeType: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model: MODEL_AUDIO,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: 'Transcribe this audio exactly.' },
      ],
    },
  });

  return response.text || '';
}

export async function generateSpeech(text: string): Promise<{ audioBase64: string; sampleRate: number }> {
  const response = await getAI().models.generateContent({
    model: MODEL_TTS,
    contents: { parts: [{ text }] },
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) throw new Error('No audio generated');

  return { audioBase64, sampleRate: 24000 };
}
