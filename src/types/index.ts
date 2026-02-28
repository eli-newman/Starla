// --- Preserved from InterviewAI ---

export interface UserProfile {
  role: string;
  company: string;
  experience: string;
  resume: string;
  focusAreas: string;
}

export interface ResearchData {
  companyContext: string;
  roleContext: string;
  suggestedQuestions: string[];
  sources?: { title: string; uri: string }[];
}

export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical' | 'situational';
}

export interface Feedback {
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
  score: number; // 1-10
}

export interface InterviewTurn {
  question: Question;
  userAnswer: string;
  feedback: Feedback | null;
  audioUrl?: string;
}

export type InterviewStep = 'onboarding' | 'researching' | 'interview' | 'summary';

// --- New for session history ---

export interface SerializedInterviewTurn {
  question: { text: string; type: string };
  userAnswer: string;
  feedback: Feedback | null;
}

export interface InterviewSession {
  id: string;
  userId: string;
  profile: UserProfile;
  history: SerializedInterviewTurn[];
  overallScore: number;
  createdAt: string;
}

// --- API request/response types ---

export interface ResearchRequest {
  role: string;
  company: string;
  resume: string;
  focusAreas: string;
}

export interface QuestionRequest {
  history: SerializedInterviewTurn[];
  researchData: ResearchData;
}

export interface EvaluateRequest {
  question: string;
  answer: string;
  context: ResearchData;
}

export interface TranscribeRequest {
  audioBase64: string;
  mimeType: string;
}

export interface TTSRequest {
  text: string;
}

export interface TTSResponse {
  audioBase64: string;
  sampleRate: number;
}

export interface SaveSessionRequest {
  profile: UserProfile;
  history: SerializedInterviewTurn[];
  overallScore: number;
}
