'use client';

import { auth } from './firebase-client';
import type {
  ResearchData,
  Feedback,
  TTSResponse,
  ResearchRequest,
  QuestionRequest,
  EvaluateRequest,
  TranscribeRequest,
  TTSRequest,
  SaveSessionRequest,
  InterviewSession,
  UserProfileData,
} from '@/types';

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function apiFetch<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
  const token = await getIdToken();
  const method = options?.method || (options?.body ? 'POST' : 'GET');

  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// --- Profile API ---

export function fetchProfile(): Promise<{ profile: UserProfileData | null }> {
  return apiFetch('/api/profile');
}

export function saveProfile(data: { experience: string; resume?: string }): Promise<{ profile: UserProfileData }> {
  return apiFetch('/api/profile', { method: 'PUT', body: data });
}

// --- Interview API ---

export function fetchResearch(data: ResearchRequest): Promise<ResearchData> {
  return apiFetch('/api/interview/research', { body: data });
}

export function fetchQuestion(data: QuestionRequest): Promise<{ text: string; type: string; difficulty: string }> {
  return apiFetch('/api/interview/question', { body: data });
}

export function fetchEvaluation(data: EvaluateRequest): Promise<Feedback> {
  return apiFetch('/api/interview/evaluate', { body: data });
}

export function fetchTranscription(data: TranscribeRequest): Promise<{ text: string }> {
  return apiFetch('/api/interview/transcribe', { body: data });
}

export function fetchTTS(data: TTSRequest): Promise<TTSResponse> {
  return apiFetch('/api/interview/tts', { body: data });
}

// --- Analytics API ---

export function fetchAnalytics(): Promise<import('@/types').AnalyticsData> {
  return apiFetch('/api/analytics');
}

// --- Sessions API ---

export function fetchSessions(): Promise<{ sessions: InterviewSession[] }> {
  return apiFetch('/api/sessions');
}

export function saveSession(data: SaveSessionRequest): Promise<{ id: string }> {
  return apiFetch('/api/sessions', { body: data });
}

export function fetchSession(id: string): Promise<{ session: InterviewSession }> {
  return apiFetch(`/api/sessions/${id}`);
}

// --- Stripe / Subscription API ---

export function createCheckoutSession(): Promise<{ url: string }> {
  return apiFetch('/api/stripe/checkout', { method: 'POST' });
}

export function fetchSubscription(): Promise<import('@/types').SubscriptionStatus> {
  return apiFetch('/api/stripe/subscription');
}

export function createPortalSession(): Promise<{ url: string }> {
  return apiFetch('/api/stripe/portal', { method: 'POST' });
}

// --- Draft API ---

export function fetchDraft(): Promise<{ draft: import('@/types').InterviewDraft | null }> {
  return apiFetch('/api/interview/draft');
}

export function saveDraft(data: import('@/types').InterviewDraft): Promise<{ success: boolean }> {
  return apiFetch('/api/interview/draft', { method: 'PUT', body: data });
}

export function deleteDraft(): Promise<{ success: boolean }> {
  return apiFetch('/api/interview/draft', { method: 'DELETE' });
}

// --- Audio helpers ---

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function base64ToAudioUrl(base64: string, sampleRate: number = 24000): string {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, bytes.length, true);

  const wavBlob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
  return URL.createObjectURL(wavBlob);
}
