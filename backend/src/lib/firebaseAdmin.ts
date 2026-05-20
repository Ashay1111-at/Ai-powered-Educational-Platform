import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (raw && raw.trim().length > 0) {
      let serviceAccount: admin.ServiceAccount;
      try {
        serviceAccount = JSON.parse(raw);
      } catch (parseErr) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON:', parseErr);
        throw parseErr;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set. Falling back to Application Default Credentials.');
      admin.initializeApp();
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
  }
}

export const auth = admin.auth();
export default admin;
