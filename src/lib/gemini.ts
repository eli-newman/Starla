import { GoogleGenAI, Type } from '@google/genai';
import { SerializedInterviewTurn, ResearchData, ExtractedJobInfo } from '@/types';

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _ai;
}

const MODEL_FLASH = 'gemini-2.5-flash';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export async function extractJobInfo(jobDescription: string): Promise<ExtractedJobInfo> {
  const prompt = `
    Extract the following from this job description:
    - role: The job title (e.g. "Senior Software Engineer", "Product Manager")
    - company: The company name
    - focusAreas: Key skills, technologies, and requirements mentioned (as a list)

    If the company name is not explicitly mentioned, use "Unknown Company".
    If the role title is not clear, infer it from the description.

    Job Description:
    ${jobDescription.slice(0, 5000)}
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FLASH,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          focusAreas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || '{"role":"Unknown Role","company":"Unknown Company","focusAreas":[]}');
}

export async function researchJob(
  jobDescription: string,
  resume: string,
  experience: string,
) {
  const prompt = `
    You are an expert interview preparation coach. Analyze this job description and prepare interview research.

    Job Description:
    ${jobDescription.slice(0, 5000)}

    Candidate Experience Level: ${experience}
    Candidate Resume (for context only — do NOT base questions on this):
    ${resume.slice(0, 1000)}

    IMPORTANT: You MUST use Google Search to research the following:
    1. Search for "[company name] interview questions" on Glassdoor, Blind, LeetCode, and Levels.fyi to find real questions that candidates have been asked at this company.
    2. Search for "[company name] interview process" to understand the interview format (number of rounds, types of interviews, timeline).
    3. Search for "[company name] [role] interview" for role-specific interview data.
    4. Search for recent news and information about the company.

    Respond with ONLY a JSON object (no markdown, no extra text) with these fields:
    - role: The job title extracted from the job description (e.g. "Senior Software Engineer", "Product Manager")
    - company: The company name extracted from the job description (use "Unknown Company" if not found)
    - companyContext: Key recent news, culture, mission, and values of the company. MUST include: the interview process/format (e.g. "3 rounds: phone screen, technical, onsite"), specific interview tips, and any known patterns from real candidate reports.
    - roleContext: Key skills, responsibilities, and expectations for this role based on the JOB DESCRIPTION and your research. Focus on what the company is looking for, NOT the candidate's resume. Include role-specific interview focus areas and the technical/domain knowledge the role demands.
    - suggestedQuestions: A list of 8 interview questions. Prioritize REAL questions reported by candidates on Glassdoor/Blind/LeetCode for this company. Fill remaining slots with questions that test the specific skills and responsibilities listed in the job description. Mix behavioral, technical, and situational. Label each with its source if from a real report. Questions should be grounded in the job requirements and company context, NOT the candidate's resume.
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FLASH,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = response.text || '{}';
  // Extract JSON from response (may be wrapped in ```json ... ```)
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : '{}';
  const result = JSON.parse(jsonStr);

  const sources =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk) =>
        chunk.web ? { title: chunk.web.title || '', uri: chunk.web.uri || '' } : null,
      )
      .filter(Boolean) || [];

  return { ...result, sources };
}

export async function generateQuestion(history: SerializedInterviewTurn[], researchData: ResearchData) {
  // Determine question type variety — avoid asking the same type consecutively
  const askedTypes = history.map((h) => h.question.type);
  const typeCounts: Record<string, number> = { behavioral: 0, technical: 0, situational: 0 };
  askedTypes.forEach((t) => { if (t in typeCounts) typeCounts[t]++; });
  const leastUsedType = Object.entries(typeCounts).sort((a, b) => a[1] - b[1])[0]?.[0] || 'behavioral';

  // Determine difficulty based on prior scores
  const scores = history.map((h) => h.feedback?.score || 0).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  let targetDifficulty = 'easy';
  if (avgScore >= 7) targetDifficulty = 'hard';
  else if (avgScore >= 5) targetDifficulty = 'medium';

  // Identify weak areas from feedback
  const weaknesses = history
    .filter((h) => h.feedback && h.feedback.score <= 4)
    .flatMap((h) => h.feedback?.improvements || []);

  const previousQuestions = history.map((h) => h.question.text);

  const prompt = `
    You are an expert interview coach conducting a mock interview.

    ## Company & Role Context
    ${researchData.companyContext}
    ${researchData.roleContext}

    ## Suggested Real Interview Questions (prioritize these)
    ${researchData.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

    ## Interview Progress
    - Questions asked so far: ${history.length}
    - Question types asked: ${askedTypes.join(', ') || 'none yet'}
    - Preferred next type: ${leastUsedType} (for variety)
    - Target difficulty: ${targetDifficulty} (based on avg score: ${avgScore.toFixed(1)})
    ${weaknesses.length > 0 ? `- Areas where candidate struggled: ${weaknesses.slice(0, 5).join('; ')}` : ''}

    ## Previous Questions (DO NOT repeat similar topics)
    ${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None yet'}

    ## Instructions
    1. Prioritize real interview questions from the suggested list above if any haven't been used
    2. Prefer the "${leastUsedType}" question type for variety, but use your judgment
    3. Set difficulty to "${targetDifficulty}"
    4. ${weaknesses.length > 0 ? 'Target the candidate\'s weak areas identified above' : 'Ask a well-rounded question for this stage of the interview'}
    5. Do NOT repeat or closely paraphrase any previous question
    6. Ground questions in the JOB DESCRIPTION requirements and company research — ask about skills, scenarios, and challenges the ROLE demands, not about the candidate's past resume

    Generate the next interview question.
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FLASH,
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
          difficulty: {
            type: Type.STRING,
            enum: ['easy', 'medium', 'hard'],
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
  resume?: string,
) {
  const prompt = `
    You are an expert interview coach evaluating a candidate's answer.

    ## Interview Question
    "${question}"

    ## Candidate's Answer
    "${answer}"

    ## Company & Role Context
    Company: ${context.companyContext}
    Role: ${context.roleContext}
${resume ? `\n    ## Candidate Background (use to personalize feedback)\n    ${resume.slice(0, 1500)}\n` : ''}
    ## Evaluation Instructions
    1. Score the answer from 1-10 based on relevance, depth, specificity, and structure
    2. List 2-4 specific strengths of the answer
    3. List 2-4 specific improvements the candidate could make${resume ? ' — reference specific skills or experiences from their background they could have leveraged' : ''}
    4. Write a model answer that demonstrates best practices (use the STAR method for behavioral questions)${resume ? ' — incorporate relevant details from the candidate\'s background' : ''}
    5. **If the score is 4 or below**, generate a targeted follow-up question that probes the specific weakness. This helps the candidate practice the area they struggled with. If the score is above 4, leave followUpQuestion empty.
  `;

  const response = await getAI().models.generateContent({
    model: MODEL_FLASH,
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
          followUpQuestion: { type: Type.STRING },
        },
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function transcribeAudio(base64: string, mimeType: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model: MODEL_FLASH,
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
