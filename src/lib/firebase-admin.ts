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
  let serviceAccountKey = raw.replace(/^['"]|['"]$/g, '');

  let parsed;
  try {
    parsed = JSON.parse(serviceAccountKey);
  } catch {
    // Vercel stores env vars with real newlines in the private_key field,
    // which are invalid control characters inside a JSON string literal.
    // Escape them so JSON.parse can handle the value.
    serviceAccountKey = serviceAccountKey.replace(/\n/g, '\\n');
    parsed = JSON.parse(serviceAccountKey);
  }

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
