import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  // Strip wrapping quotes (single or double) that may be copied from .env files
  const serviceAccountKey = raw.replace(/^['"]|['"]$/g, '');

  let parsed;
  try {
    parsed = JSON.parse(serviceAccountKey);
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', (e as Error).message);
    console.error('First 50 chars:', serviceAccountKey.substring(0, 50));
    throw e;
  }

  // Vercel env vars may store private_key with literal "\n" instead of newlines
  if (parsed.private_key && typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  console.log('Firebase Admin init — project:', parsed.project_id, 'email:', parsed.client_email);

  return initializeApp({
    credential: cert(parsed),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
