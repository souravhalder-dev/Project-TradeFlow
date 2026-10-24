import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const hasValidAdminConfig = Boolean(projectId && clientEmail && privateKey && privateKey.includes('BEGIN PRIVATE KEY'));

let adminApp: admin.app.App | null = null;

if (hasValidAdminConfig) {
  try {
    if (admin.apps.length === 0) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = admin.apps[0]!;
    }
  } catch (error) {
    console.warn('Firebase Admin initialization warning:', error);
  }
}

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  name?: string;
  role?: string;
}

/**
 * Verifies a Firebase ID token or dev simulated token on the server.
 */
export async function verifyServerToken(idToken: string): Promise<DecodedAuthToken | null> {
  if (!idToken) return null;

  // Development simulation bypass for testing & demo accounts without requiring Google Service Account
  if (process.env.AUTH_DEV_MODE === 'true' || !hasValidAdminConfig) {
    if (idToken.startsWith('demo_token_')) {
      const parts = idToken.split('_');
      const role = parts[2]?.toUpperCase() || 'BUYER';
      if (role === 'ADMIN') {
        return {
          uid: 'demo_admin_uid_001',
          email: 'admin@tradeflow.com',
          name: 'Sarah Jenkins',
          role: 'ADMIN',
        };
      } else if (role === 'SUPPLIER') {
        return {
          uid: 'demo_supplier_uid_001',
          email: 'supplier@apex.com',
          name: 'David Zhang',
          role: 'SUPPLIER',
        };
      } else {
        return {
          uid: 'demo_buyer_uid_001',
          email: 'buyer@globalmerch.com',
          name: 'Marcus Vance',
          role: 'BUYER',
        };
      }
    }
  }

  // Real Firebase Admin verification
  if (adminApp) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0],
      };
    } catch (err) {
      console.error('Firebase token verification error:', err);
      return null;
    }
  }

  return null;
}
