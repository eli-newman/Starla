import type { InterviewTurn, SerializedInterviewTurn } from '@/types';

export function serializeHistory(history: InterviewTurn[]): SerializedInterviewTurn[] {
  return history.map((h) => ({
    question: { text: h.question.text, type: h.question.type, difficulty: h.question.difficulty },
    userAnswer: h.userAnswer,
    feedback: h.feedback,
    responseTimeSeconds: h.responseTimeSeconds,
    inputMode: h.inputMode,
    answerWordCount: h.answerWordCount,
    transcriptionEdited: h.transcriptionEdited,
  }));
}
