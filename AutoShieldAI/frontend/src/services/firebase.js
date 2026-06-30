import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCH-K9MBGROCKPXT2FzUWVNPHqMxTzs49U',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'autoshieldai4.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'autoshieldai4',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'autoshieldai4.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '963135916850',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:963135916850:web:912e65e58d13658443652b',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-6RD27QPTDX'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export { firebaseConfig };