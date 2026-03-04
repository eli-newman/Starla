// --- User profile (stored in Firestore profiles/{uid}) ---

export interface UserProfileData {
  experience: string;
  resume: string;
  createdAt: string;
  updatedAt: string;
}

// --- Per-interview job setup ---

export interface JobSetup {
  jobDescription: string;
  companyName: string;
}

// --- Extracted job info (from Gemini) ---

export interface ExtractedJobInfo {
  role: string;
  company: string;
  focusAreas: string[];
}

// --- Legacy UserProfile (kept for backward compat with old sessions) ---

export interface UserProfile {
  role: string;
  company: string;
  experience: string;
  resume: string;
  focusAreas: string;
}

// --- Research ---

export interface ResearchData {
  companyContext: string;
  roleContext: string;
  suggestedQuestions: string[];
  sources?: { title: string; uri: string }[];
  role?: string;
  company?: string;
}

// --- Interview ---

export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical' | 'situational';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Feedback {
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
  score: number; // 1-10
  followUpQuestion?: string;
}

export interface InterviewTurn {
  question: Question;
  userAnswer: string;
  feedback: Feedback | null;
  audioUrl?: string;
  responseTimeSeconds?: number; // Time from question shown to answer confirmed
  inputMode?: 'audio' | 'typed'; // How the user answered
  answerWordCount?: number; // Word count of final answer
  transcriptionEdited?: boolean; // Did user edit the audio transcription?
}

export type InterviewStep = 'profile-setup' | 'job-setup' | 'researching' | 'interview' | 'summary';

// --- Session history ---

export interface SerializedInterviewTurn {
  question: { text: string; type: string; difficulty?: string };
  userAnswer: string;
  feedback: Feedback | null;
  responseTimeSeconds?: number;
  inputMode?: 'audio' | 'typed';
  answerWordCount?: number;
  transcriptionEdited?: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  profile: UserProfile;
  jobDescription?: string;
  history: SerializedInterviewTurn[];
  overallScore: number;
  createdAt: string;
  sessionDurationSeconds?: number;
  completedAllQuestions?: boolean;
  followUpsOffered?: number;
  followUpsTaken?: number;
}

// --- Gamification ---

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
}

export interface XPData {
  totalXP: number;
  currentLevel: number;
  currentLevelName: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  xpNeeded: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export interface WeeklyGoalData {
  sessionsThisWeek: number;
  weeklyTarget: number;
  weekStartDate: string;
}

// --- Analytics ---

export interface AnalyticsData {
  totalSessions: number;
  averageScore: number;
  scoreHistory: { date: string; score: number }[];
  strengthFrequency: { text: string; count: number }[];
  improvementFrequency: { text: string; count: number }[];
  questionTypeBreakdown: { type: string; avgScore: number; count: number }[];
  averageResponseTimeSeconds?: number;
  averageSessionDurationSeconds?: number;
  completionRate?: number; // 0-100
  difficultyBreakdown?: { difficulty: string; avgScore: number; count: number }[];
  inputModeBreakdown?: { mode: string; count: number; avgScore: number }[];
  averageAnswerWordCount?: number;
  transcriptionEditRate?: number; // 0-100, % of audio answers that were edited
  followUpRate?: number; // 0-100, % of offered follow-ups that were taken
  scoreDistribution?: { range: string; count: number }[]; // e.g. "1-3", "4-6", "7-10"
  streak?: StreakData;
  xp?: XPData;
  achievements?: Achievement[];
  weeklyGoal?: WeeklyGoalData;
}

// --- API request/response types ---

export interface ResearchRequest {
  jobDescription: string;
  resume: string;
  experience: string;
}

export interface QuestionRequest {
  history: SerializedInterviewTurn[];
  researchData: ResearchData;
}

export interface EvaluateRequest {
  question: string;
  answer: string;
  context: ResearchData;
  resume?: string;
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
  profile: UserProfileData & { role?: string; company?: string };
  jobDescription: string;
  history: SerializedInterviewTurn[];
  overallScore: number;
  sessionDurationSeconds?: number;
  completedAllQuestions?: boolean;
  followUpsOffered?: number;
  followUpsTaken?: number;
}

// --- Subscription ---

export interface SubscriptionData {
  stripeSubscriptionId: string;
  status: string;
  plan: 'free' | 'pro';
  cancelAt: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export interface SubscriptionStatus {
  plan: 'free' | 'pro';
  subscription: SubscriptionData | null;
}

// --- Interview Draft (auto-save / resume) ---

export interface InterviewDraft {
  jobDescription: string;
  companyName?: string;
  researchData: ResearchData;
  questions: Array<{ text: string; type: string; difficulty?: string; id: string }>;
  currentQuestionIndex: number;
  history: SerializedInterviewTurn[];
  sessionStartTimestamp: number;
  followUpsOffered: number;
  followUpsTaken: number;
  updatedAt: string;
}
