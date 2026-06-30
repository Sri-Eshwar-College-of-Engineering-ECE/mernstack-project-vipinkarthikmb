const router = require('express').Router();
const { auth, db } = require('../services/firebase');
const { upsertUserProfile, getUserProfile } = require('../services/store');
const { createOrRenewPolicy, getActivePolicy } = require('../services/policyEngine');
const { requireRole } = require('../middleware/auth');

let bcrypt = null;
try {
  // Optional dependency for legacy bcrypt hashes.
  // eslint-disable-next-line global-require
  bcrypt = require('bcryptjs');
} catch {
  bcrypt = null;
}

function normalizePhone(value = '') {
  return String(value || '').replace(/\D/g, '');
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function syntheticEmailFromPhone(phone = '') {
  const normalized = normalizePhone(phone);
  if (!normalized) return '';
  return `${normalized}@autoshield.local`;
}

function isCredentialError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('could not load the default credentials')
    || message.includes('application default credentials')
    || message.includes('firebase admin credentials missing');
}

async function verifyPassword(plainPassword, storedPassword = '', storedPasswordHash = '') {
  const plain = String(plainPassword || '');
  const hash = String(storedPasswordHash || '');
  const raw = String(storedPassword || '');

  if (!plain) return false;

  if (hash) {
    if (bcrypt) {
      return bcrypt.compare(plain, hash);
    }

    // Support environments without bcryptjs only if plain text matches.
    return plain === hash;
  }

  if (!raw) return false;
  if (bcrypt && raw.startsWith('$2')) {
    return bcrypt.compare(plain, raw);
  }

  return plain === raw;
}

async function findUserByIdentifier(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  const maybePhone = normalizePhone(raw);
  const maybeEmail = normalizeEmail(raw);

  if (maybePhone.length >= 10) {
    const byPhone = await db
      .collection('users')
      .where('phone', '==', maybePhone)
      .limit(1)
      .get();
    if (!byPhone.empty) {
      const doc = byPhone.docs[0];
      return { uid: doc.id, ...doc.data() };
    }
  }

  const byEmail = await db
    .collection('users')
    .where('email', '==', maybeEmail)
    .limit(1)
    .get();
  if (!byEmail.empty) {
    const doc = byEmail.docs[0];
    return { uid: doc.id, ...doc.data() };
  }

  return null;
}

function deriveAuthPayload(body, uid) {
  const plainPassword = String(body.password || '');
  let passwordHash = body.passwordHash || '';

  if (!passwordHash && plainPassword) {
    if (bcrypt) {
      passwordHash = bcrypt.hashSync(plainPassword, 10);
    } else {
      passwordHash = plainPassword;
    }
  }

  return {
    uid,
    name: body.name || body.displayName || 'AutoShield Worker',
    phone: body.phone || '',
    email: body.email || '',
    zone: body.zone || 'semi-urban',
    vehicleType: body.vehicleType || 'bike',
    avgIncome: Number(body.avgIncome || 0),
    role: body.role || 'worker',
    locale: body.locale || 'en',
    language: body.language || body.locale || 'en',
    walletBalance: Number(body.walletBalance || 0),
    largeFont: Boolean(body.largeFont),
    colorBlindTheme: Boolean(body.colorBlindTheme),
    literacyMode: Boolean(body.literacyMode),
    voiceOnboarding: Boolean(body.voiceOnboarding),
    deviceFingerprint: body.deviceFingerprint || '',
    passwordHash,
    authMode: 'credential'
  };
}

// POST /api/auth/bootstrap
router.post('/bootstrap', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Firebase ID token required' });
    }

    const decoded = await auth.verifyIdToken(token);
    const payload = deriveAuthPayload(req.body || {}, decoded.uid);
    const existing = await getUserProfile(decoded.uid);

    try {
      await auth.setCustomUserClaims(decoded.uid, { role: payload.role });
    } catch (claimError) {
      console.warn('[Auth] Unable to set custom claims during bootstrap:', claimError.message);
    }
    const profile = await upsertUserProfile(decoded.uid, {
      ...existing,
      ...payload,
      uid: decoded.uid,
      activePolicyId: existing?.activePolicyId || null,
      createdAt: existing?.createdAt || new Date().toISOString()
    });

    const activePolicy = await getActivePolicy(decoded.uid);
    const policy = activePolicy || await createOrRenewPolicy(profile, {}, { source: 'bootstrap' });

    return res.status(201).json({
      user: profile,
      policy
    });
  } catch (error) {
    if (isCredentialError(error)) {
      return res.status(503).json({
        error: 'Authentication backend credentials are unavailable.',
        code: 'AUTH_BACKEND_CREDENTIALS_UNAVAILABLE'
      });
    }

    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordValid = await verifyPassword(password, user.password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const uid = user.uid;
    const authEmail = normalizeEmail(user.email) || syntheticEmailFromPhone(user.phone);

    try {
      await auth.getUser(uid);
    } catch {
      const createPayload = {
        uid,
        displayName: user.name || 'Worker'
      };

      if (authEmail) {
        createPayload.email = authEmail;
        createPayload.emailVerified = true;
      }

      await auth.createUser(createPayload);
    }

    const role = user.role || 'worker';
    try {
      await auth.setCustomUserClaims(uid, { role });
    } catch {
      // Non-blocking role update.
    }

    const customToken = await auth.createCustomToken(uid, { role });
    return res.json({
      customToken,
      user: {
        uid,
        name: user.name || 'Worker',
        role,
        phone: user.phone || '',
        email: authEmail
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Firebase ID token required' });
    }

    const decoded = await auth.verifyIdToken(token);
    const profile = await getUserProfile(decoded.uid);
    return res.json({ user: profile || null, role: profile?.role || decoded.role || 'worker' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

// PATCH /api/auth/me
router.patch('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Firebase ID token required' });
    }

    const decoded = await auth.verifyIdToken(token);
    const existing = await getUserProfile(decoded.uid);
    const updated = await upsertUserProfile(decoded.uid, {
      ...existing,
      ...req.body,
      uid: decoded.uid,
      updatedAt: new Date().toISOString()
    });

    return res.json({ user: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/role', requireRole('admin'), async (req, res) => {
  try {
    const { uid, role } = req.body;
    if (!uid || !role) {
      return res.status(400).json({ error: 'uid and role are required' });
    }

    try {
      await auth.setCustomUserClaims(uid, { role });
    } catch (claimError) {
      console.warn('[Auth] Unable to set custom claims for role update:', claimError.message);
    }
    const profile = await upsertUserProfile(uid, { role, updatedAt: new Date().toISOString() });
    return res.json({ user: profile });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
