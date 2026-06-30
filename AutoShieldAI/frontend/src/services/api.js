import { auth } from './firebase';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const GET_CACHE_TTL_MS = 7000;
const getResponseCache = new Map();
const inflightRequests = new Map();

async function buildHeaders(extraHeaders = {}, forceTokenRefresh = false) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(forceTokenRefresh);
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn('[API] Unable to attach Firebase token:', error.message);
    }
  }

  return headers;
}

async function parsePayload(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
}

function getCacheKey(method, path, body) {
  const normalizedBody = body == null ? '' : JSON.stringify(body);
  return `${method}:${path}:${normalizedBody}`;
}

async function request(method, path, body, options = {}) {
  const { fresh = false, forceTokenRefresh = false, _authRetried = false } = options;
  const cacheKey = getCacheKey(method, path, body);

  if (method === 'GET' && !fresh) {
    const cached = getResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GET_CACHE_TTL_MS) {
      return { data: cached.data, cached: true };
    }

    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const execution = (async () => {
    try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: await buildHeaders({}, forceTokenRefresh),
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    const payload = await parsePayload(response);

    const tokenError = String(payload?.error || '').toLowerCase();
    const canRetryAuth = response.status === 401
      && auth.currentUser
      && !_authRetried
      && tokenError.includes('invalid firebase token');

    if (canRetryAuth) {
      return request(method, path, body, {
        ...options,
        forceTokenRefresh: true,
        _authRetried: true
      });
    }

    if (!response.ok) {
      const error = new Error(payload?.error || payload || 'Request failed');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    if (method === 'GET') {
      getResponseCache.set(cacheKey, {
        data: payload,
        timestamp: Date.now()
      });
    }

    return { data: payload };
    } finally {
      clearTimeout(timeout);
      inflightRequests.delete(cacheKey);
    }
  })();

  if (method === 'GET' && !fresh) {
    inflightRequests.set(cacheKey, execution);
  }

  return execution;
}

const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  delete: (path, body, options) => request('DELETE', path, body, options)
};

export default api;
