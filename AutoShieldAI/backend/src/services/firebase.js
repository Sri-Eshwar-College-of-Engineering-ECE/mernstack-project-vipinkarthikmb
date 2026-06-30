const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadServiceAccountFromPath() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    return null;
  }

  const resolvedPath = path.resolve(serviceAccountPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH does not exist: ${resolvedPath}`);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(raw);
}

function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'autoshieldai4';
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountFromPath = loadServiceAccountFromPath();

  if (serviceAccountJson || serviceAccountFromPath) {
    const serviceAccount = serviceAccountFromPath || JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId
      });
    } catch (error) {
      throw new Error(
        'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON, or run gcloud auth application-default login.'
      );
    }
  }

  return admin.app();
}

initializeFirebaseAdmin();

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

module.exports = {
  admin,
  auth,
  db,
  FieldValue,
  Timestamp,
  initializeFirebaseAdmin
};