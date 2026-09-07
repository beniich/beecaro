let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.warn("firebase-admin not installed, running without it");
}

let app = null;

const initFirebaseAdmin = () => {
  if (!admin) return null;
  if (admin.apps && admin.apps.length > 0) return admin.apps[0];

  try {
    const firebaseConfig = require('../../../firebase-applet-config.json');
    if (firebaseConfig && firebaseConfig.projectId) {
      app = admin.initializeApp({
        projectId: firebaseConfig.projectId
      });
      console.log('🔥 Firebase Admin: initialized with applet config');
      return app;
    }
  } catch (err) {
    // ignore missing config
  }

  console.warn('⚠️ Firebase Admin: no credentials found — mock mode (dev only)');
  return null;
};

const firebaseAdmin = initFirebaseAdmin();

const verifyFirebaseToken = async (idToken) => {
  if (!firebaseAdmin || !admin) {
    // Fallback pour dev local sans credentials
    try {
      const parts = idToken.split('.');
      if (parts.length >= 2) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return decoded;
      }
    } catch {
      // ignore
    }
    return { uid: 'dev-user', email: 'admin@cafm.com' };
  }

  return admin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseToken, firebaseAdmin };
