# Starla -- AI Interview Coach

AI-powered interview preparation that uses Google's Gemini models for company/role research, question generation, answer evaluation, voice transcription, and text-to-speech. Practice behavioral, technical, and situational interviews with real-time voice interaction and detailed feedback.

## Features

- **AI-powered research** -- Researches the target company and role using Gemini with Google Search grounding, providing up-to-date context and suggested questions with source citations.
- **Adaptive question generation** -- Generates behavioral, technical, and situational questions tailored to the role, company, and interview history.
- **Answer evaluation** -- Scores answers 1-10 with specific strengths, areas for improvement, and a model answer.
- **Voice interaction** -- Record answers via microphone with AI transcription, and hear questions read aloud with text-to-speech.
- **Session history** -- Save completed interviews to Firestore and review past sessions with per-question breakdowns.
- **Google OAuth authentication** -- Secure sign-in with Firebase Authentication.
- **Dark theme UI** -- Minimal dark interface with smooth animations.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Firebase** -- Authentication (Google OAuth) + Firestore (session storage)
- **Google Gemini API** -- gemini-3-flash, gemini-3.1-pro, gemini-2.5-flash-tts
- **Motion** -- UI animations
- **Vitest** + React Testing Library -- testing
- **Lucide React** -- icons
- **react-markdown** -- rendering markdown feedback

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Google Cloud account with the Gemini API enabled
- A Firebase project

### Installation

```bash
git clone <repo-url>
cd starla
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your credentials (see below).

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/apikey). Server-only. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON string of your Firebase service account key. Generate from Firebase Console > Project Settings > Service Accounts > Generate New Private Key. Server-only. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key from Firebase Console > Project Settings > General. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g. `your-project.firebaseapp.com`). |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket (e.g. `your-project.firebasestorage.app`). |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID. |

### Firebase Setup

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** and add the **Google** sign-in provider.
3. Create a **Firestore Database** (start in production mode).
4. Go to Project Settings > Service Accounts > **Generate New Private Key**. Paste the entire JSON as the `FIREBASE_SERVICE_ACCOUNT_KEY` env var.
5. Deploy the security rules:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

All `/api/interview/*` and `/api/sessions/*` endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header. Rate limiting is applied per user.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (no auth required) |
| `POST` | `/api/interview/research` | Research a company and role using Gemini with Google Search |
| `POST` | `/api/interview/question` | Generate the next interview question based on history and research |
| `POST` | `/api/interview/evaluate` | Evaluate a user's answer and return feedback with score |
| `POST` | `/api/interview/transcribe` | Transcribe audio to text using Gemini |
| `POST` | `/api/interview/tts` | Convert text to speech using Gemini TTS |
| `GET` | `/api/sessions` | List all interview sessions for the authenticated user |
| `POST` | `/api/sessions` | Save a completed interview session |
| `GET` | `/api/sessions/[id]` | Get a specific session by ID (owner-only) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run test:run` | Run tests once with Vitest |
| `npm test` | Run tests in watch mode |

## Architecture

**Client-side:**
- Firebase Authentication handles Google OAuth sign-in and token management.
- React components manage the interview flow: onboarding, research, question/answer loop, and summary.
- Audio recording uses the browser MediaRecorder API.
- All AI interactions go through server-side API routes -- no API keys are exposed to the client.

**Server-side:**
- Next.js API routes proxy all Gemini calls, keeping API keys secure.
- Firebase Admin SDK verifies auth tokens and manages Firestore reads/writes.
- Rate limiting and input validation protect all endpoints.
- Multiple Gemini models are used for different tasks: Flash for research and transcription, Pro for reasoning (questions and evaluation), and Flash TTS for speech synthesis.

## Deployment

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Deploy. Vercel will automatically detect the Next.js framework.

Make sure to add your Vercel deployment URL to the Firebase Console under Authentication > Settings > Authorized Domains.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and add tests.
4. Run `npm run lint && npm run type-check && npm run test:run` to verify.
5. Submit a pull request.

## License

MIT
