import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithCustomToken, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import api from '../services/api';
import { auth, db } from '../services/firebase';
import { translate } from '../i18n';

const PlatformContext = createContext(null);

const DEFAULT_UI = {
  locale: 'en',
  largeFont: false,
  colorBlindTheme: false,
  literacyMode: false,
  voiceOnboarding: false
};

function isFirestoreOfflineError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('client is offline') || message.includes('offline') || message.includes('network');
}

function buildFallbackProfile(currentUser, locale = 'en') {
  return {
    id: currentUser.uid,
    uid: currentUser.uid,
    name: currentUser.displayName || 'AutoShield Worker',
    email: currentUser.email || '',
    role: 'worker',
    language: locale,
    locale
  };
}

function getSyntheticEmail(phone) {
  return `${String(phone || '').replace(/\D/g, '')}@autoshield.local`;
}

function looksLikeInfraAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('default credentials')
    || message.includes('application default credentials')
    || message.includes('auth_backend_credentials_unavailable')
    || message.includes('authentication backend credentials are unavailable')
    || message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('request failed');
}

function buildLoginCandidates(identifier) {
  const raw = String(identifier || '').trim().toLowerCase();
  if (!raw) return [];

  const digits = raw.replace(/\D/g, '');
  const candidates = [];

  if (raw.includes('@')) {
    candidates.push(raw);
  }

  if (digits.length >= 10) {
    candidates.push(getSyntheticEmail(digits));
  }

  if (!candidates.includes(raw) && raw.includes('@')) {
    candidates.push(raw);
  }

  return [...new Set(candidates)];
}

export function PlatformProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ui, setUi] = useState(() => {
    try {
      return { ...DEFAULT_UI, ...(JSON.parse(localStorage.getItem('autoshield-ui') || '{}')) };
    } catch {
      return DEFAULT_UI;
    }
  });

  useEffect(() => {
    let disposed = false;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (disposed) return;

      setFirebaseUser(currentUser || null);
      setLoading(false);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      (async () => {
        try {
          const ref = doc(db, 'users', currentUser.uid);
          const snapshot = await getDoc(ref);
          if (disposed) return;

          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() };
            setProfile(data);
            setUi((previous) => ({ ...previous, locale: data.language || data.locale || previous.locale }));
          } else {
            setProfile(buildFallbackProfile(currentUser, ui.locale));
          }
        } catch (error) {
          if (disposed) return;

          if (!isFirestoreOfflineError(error)) {
            console.error('Failed to load profile from Firestore:', error);
          }

          setProfile(buildFallbackProfile(currentUser, ui.locale));
        }
      })();
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('autoshield-ui', JSON.stringify(ui));
  }, [ui]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('large-font', Boolean(ui.largeFont));
    root.classList.toggle('theme-accessible', Boolean(ui.colorBlindTheme));
    root.lang = ui.locale || 'en';
  }, [ui.largeFont, ui.colorBlindTheme, ui.locale]);

  async function signInWithPhonePassword({ phone, password }) {
    if (!/^\d{10}$/.test(String(phone || '').trim())) {
      throw new Error('Enter a valid 10-digit phone number.');
    }
    if (String(password || '').length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const email = getSyntheticEmail(phone);
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithIdentifierPassword({ identifier, password }) {
    const loginIdentifier = String(identifier || '').trim();
    const loginPassword = String(password || '');

    if (!loginIdentifier) {
      throw new Error('Enter email or mobile number.');
    }
    if (loginPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const response = await api.post('/auth/login', {
        identifier: loginIdentifier,
        password: loginPassword
      });

      const customToken = response?.data?.customToken;
      if (!customToken) {
        throw new Error('Unable to start secure session.');
      }

      await signInWithCustomToken(auth, customToken);
      return response.data;
    } catch (error) {
      if (!looksLikeInfraAuthError(error)) {
        throw error;
      }

      const candidates = buildLoginCandidates(loginIdentifier);
      let lastError = error;

      for (const email of candidates) {
        try {
          await signInWithEmailAndPassword(auth, email, loginPassword);
          return {
            fallback: true,
            method: 'client-email-password'
          };
        } catch (clientError) {
          lastError = clientError;
        }
      }

      throw lastError;
    }
  }

  async function registerWorker(details) {
    const email = details.email || getSyntheticEmail(details.phone);
    const credentials = await createUserWithEmailAndPassword(auth, email, details.password);
    await updateProfile(credentials.user, { displayName: details.name || 'AutoShield Worker' });

    const userDoc = {
      uid: credentials.user.uid,
      name: details.name || 'AutoShield Worker',
      phone: details.phone || '',
      email,
      zone: details.zone || 'semi-urban',
      vehicleType: details.vehicleType || 'bike',
      avgIncome: Number(details.avgIncome || 0),
      role: details.role || 'worker',
      walletBalance: Number(details.walletBalance || 0),
      subscriptionStatus: 'pending',
      language: details.language || details.locale || 'en',
      locale: details.language || details.locale || 'en',
      literacyMode: Boolean(details.literacyMode),
      largeFont: Boolean(details.largeFont),
      colorBlindTheme: Boolean(details.colorBlindTheme),
      voiceOnboarding: Boolean(details.voiceOnboarding),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', credentials.user.uid), userDoc, { merge: true });
    setProfile({ id: credentials.user.uid, ...userDoc });

    try {
      await api.post('/auth/bootstrap', {
        name: userDoc.name,
        phone: userDoc.phone,
        email: userDoc.email,
        zone: userDoc.zone,
        vehicleType: userDoc.vehicleType,
        avgIncome: userDoc.avgIncome,
        role: userDoc.role,
        locale: userDoc.locale,
        language: userDoc.language,
        walletBalance: userDoc.walletBalance,
        largeFont: userDoc.largeFont,
        colorBlindTheme: userDoc.colorBlindTheme,
        literacyMode: userDoc.literacyMode,
        voiceOnboarding: userDoc.voiceOnboarding
      });
    } catch (error) {
      // Keep local registration successful even if backend bootstrap is temporarily unavailable.
      if (!looksLikeInfraAuthError(error)) {
        throw error;
      }
      console.warn('Backend bootstrap unavailable during registration:', error.message);
    }

    return credentials.user;
  }

  async function saveProfile(updates) {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    const ref = doc(db, 'users', auth.currentUser.uid);
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });

    try {
      const snapshot = await getDoc(ref);
      const updated = { id: snapshot.id, ...snapshot.data() };
      setProfile(updated);
      return updated;
    } catch (error) {
      if (isFirestoreOfflineError(error)) {
        const offlineUpdated = {
          ...(profile || buildFallbackProfile(auth.currentUser, ui.locale)),
          ...updates,
          uid: auth.currentUser.uid
        };
        setProfile(offlineUpdated);
        return offlineUpdated;
      }

      throw error;
    }
  }

  async function requestPasswordReset(phone) {
    return sendPasswordResetEmail(auth, getSyntheticEmail(phone));
  }

  async function signOutUser() {
    await signOut(auth);
  }

  const value = useMemo(() => ({
    firebaseUser,
    profile,
    loading,
    ui,
    setUi,
    isAuthenticated: Boolean(firebaseUser),
    locale: ui.locale,
    t(key, fallback = '') {
      return translate(ui.locale, key, fallback);
    },
    setLocale(locale) {
      setUi((previous) => ({ ...previous, locale }));
    },
    setAccessibility(next) {
      setUi((previous) => ({ ...previous, ...next }));
    },
    signInWithPhonePassword,
    signInWithIdentifierPassword,
    registerWorker,
    saveProfile,
    requestPasswordReset,
    signOutUser,
    refreshProfile: async () => {
      if (!auth.currentUser) return null;
      const ref = doc(db, 'users', auth.currentUser.uid);

      try {
        const snapshot = await getDoc(ref);
        const updated = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        setProfile(updated);
        return updated;
      } catch (error) {
        if (isFirestoreOfflineError(error)) {
          const fallback = buildFallbackProfile(auth.currentUser, ui.locale);
          setProfile((previous) => previous || fallback);
          return profile || fallback;
        }

        throw error;
      }
    }
  }), [firebaseUser, profile, loading, ui]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used inside PlatformProvider');
  }

  return context;
}

export function buildSyntheticEmail(phone) {
  return getSyntheticEmail(phone);
}