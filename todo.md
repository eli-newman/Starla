# Onboarding Flow Redesign — Progress

## M1: Types + Profile API
- [ ] Update `src/types/index.ts` — add UserProfileData, JobSetup; update ResearchRequest, InterviewStep, SaveSessionRequest
- [ ] Create `src/app/api/profile/route.ts` — GET/PUT profile in Firestore
- [ ] Update `src/lib/api-client.ts` — add fetchProfile(), saveProfile(), generateCoverLetter()
- [ ] Update `firestore.rules` — add profiles/{userId} rules
- [ ] Update tests for research route

## M2: Auth Context + Profile Detection
- [ ] Extend `src/lib/auth-context.tsx` — add profile, profileLoading, hasProfile, refreshProfile

## M3: Profile Setup Component
- [ ] Create `src/components/profile-setup.tsx`

## M4: Gemini Updates
- [ ] Add extractJobInfo() to gemini.ts
- [ ] Rename researchRole() → researchJob() with JD-based signature
- [ ] Add generateCoverLetter() to gemini.ts
- [ ] Update gemini tests

## M5: Job Setup + Cover Letter
- [ ] Create `src/components/job-setup.tsx`
- [ ] Create `src/app/api/interview/cover-letter/route.ts`
- [ ] Update `src/app/api/interview/research/route.ts`

## M6: Interview Flow Rewrite
- [ ] Rewrite `src/components/interview-flow.tsx` state machine
- [ ] Delete `src/components/onboarding.tsx`

## M7: Polish
- [ ] Update `src/components/app-shell.tsx` — add profile edit link
- [ ] Update sessions POST to include jobDescription
- [ ] Run all checks: tsc, vitest, build
