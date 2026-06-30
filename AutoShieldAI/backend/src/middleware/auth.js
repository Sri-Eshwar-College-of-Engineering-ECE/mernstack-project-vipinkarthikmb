const { auth } = require('../services/firebase');
const { getUserProfile } = require('../services/store');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return req.query?.token || null;
}

function isCredentialError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('could not load the default credentials')
    || message.includes('application default credentials')
    || message.includes('credentials are unavailable');
}

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format');
  }

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padding = payload.length % 4;
  const normalized = padding ? `${payload}${'='.repeat(4 - padding)}` : payload;
  const decoded = Buffer.from(normalized, 'base64').toString('utf8');
  return JSON.parse(decoded);
}

async function resolveDecodedToken(token) {
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    // Local development fallback for environments where admin auth credentials are unavailable.
    if (process.env.NODE_ENV === 'production' || !isCredentialError(error)) {
      throw error;
    }

    const payload = decodeJwtPayload(token);
    const uid = payload.user_id || payload.uid || payload.sub;
    if (!uid) {
      throw error;
    }

    return {
      ...payload,
      uid
    };
  }
}

async function authMiddleware(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Firebase ID token required' });
  }

  try {
    const decoded = await resolveDecodedToken(token);
    let profile = null;

    try {
      profile = await getUserProfile(decoded.uid);
    } catch (profileError) {
      if (!isCredentialError(profileError)) {
        throw profileError;
      }
    }

    const resolvedUid = profile?.uid || decoded.uid;

    req.auth = decoded;
    req.user = {
      ...(profile || {}),
      uid: resolvedUid,
      role: profile?.role || decoded.role || decoded.firebase?.sign_in_provider || 'worker'
    };

    return next();
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('could not load the default credentials') || message.includes('application default credentials')) {
      return res.status(503).json({
        error: 'Authentication backend credentials are unavailable.',
        code: 'AUTH_BACKEND_CREDENTIALS_UNAVAILABLE'
      });
    }

    if (message.includes('has expired') || message.includes('expired')) {
      return res.status(401).json({ error: 'Firebase token expired' });
    }

    if (message.includes('incorrect') && message.includes('aud')) {
      return res.status(401).json({ error: 'Firebase token project mismatch' });
    }

    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.auth?.role || req.auth?.token?.role || 'worker';
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden for this role' });
    }

    return next();
  };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
