const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const { logError } = require('./logger');

const auth = new GoogleAuth();
let serviceAuthAvailable = process.env.AI_REQUIRE_SERVICE_AUTH !== 'true';

function riskEndpoint() {
  return process.env.AI_RISK_URL || '';
}

function fraudEndpoint() {
  return process.env.AI_FRAUD_URL || '';
}

async function buildServiceAuthHeader(targetUrl) {
  if (!serviceAuthAvailable) {
    return {};
  }

  const audience = process.env.CLOUD_RUN_AUDIENCE || new URL(targetUrl).origin;
  try {
    const client = await auth.getIdTokenClient(audience);
    const headers = await client.getRequestHeaders(targetUrl);
    return headers.Authorization ? { Authorization: headers.Authorization } : {};
  } catch (error) {
    serviceAuthAvailable = false;
    logError('Cloud Run authentication unavailable; retrying without service credentials', error, { audience });
    return {};
  }
}

async function callAiEndpoint(url, payload, fallbackResponse) {
  if (!url) {
    return fallbackResponse;
  }

  try {
    const authHeader = await buildServiceAuthHeader(url);
    const response = await axios.post(url, payload, {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });

    return response.data;
  } catch (error) {
    logError('AI endpoint invocation failed', error, { url });
    if (String(error?.message || '').includes('Could not load the default credentials')) {
      serviceAuthAvailable = false;
    }
    return fallbackResponse;
  }
}

async function getRiskScore(payload = {}) {
  const fallback = {
    riskScore: Number(payload?.policy?.riskScore || 0.45),
    riskBand: 'medium',
    explanation: 'Fallback risk score used because AI service was unavailable.'
  };

  return callAiEndpoint(riskEndpoint(), payload, fallback);
}

async function getFraudScore(payload = {}) {
  const fallback = {
    score: 45,
    riskBand: 'medium',
    reasons: ['Fallback fraud score used because AI service was unavailable.']
  };

  return callAiEndpoint(fraudEndpoint(), payload, fallback);
}

module.exports = {
  getFraudScore,
  getRiskScore
};