const axios = require('axios');

const ZONE_COORDINATES = {
  urban: { lat: 13.0827, lon: 80.2707, label: 'urban corridor' },
  'semi-urban': { lat: 12.9716, lon: 77.5946, label: 'semi-urban corridor' },
  rural: { lat: 11.1271, lon: 78.6569, label: 'rural corridor' }
};

function getWeatherKey() {
  return process.env.OPENWEATHER_API_KEY || process.env.OWM_API_KEY || '';
}

function getAqiKey() {
  return process.env.WAQI_API_TOKEN || process.env.AQI_API_TOKEN || '';
}

function getZoneContext(zone = 'semi-urban') {
  return ZONE_COORDINATES[zone] || ZONE_COORDINATES['semi-urban'];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function fetchWeatherSnapshot(zone = 'semi-urban') {
  const key = getWeatherKey();
  const { lat, lon } = getZoneContext(zone);

  if (!key) {
    return {
      rainfall: zone === 'urban' ? 18 : 7,
      temperature: zone === 'rural' ? 31 : 34,
      source: 'fallback'
    };
  }

  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const { data } = await axios.get(url, {
    params: { lat, lon, appid: key, units: 'metric' },
    timeout: 5000
  });

  const rainfall = Number(data?.rain?.['1h'] ?? data?.rain?.['3h'] ?? 0);
  const temperature = Number(data?.main?.temp ?? 30);

  return {
    rainfall: clamp(rainfall, 0, 400),
    temperature: clamp(temperature, -5, 60),
    source: 'openweathermap',
    raw: {
      weather: data?.weather?.[0]?.main,
      humidity: data?.main?.humidity,
      windSpeed: data?.wind?.speed
    }
  };
}

async function fetchAqiSnapshot(zone = 'semi-urban') {
  const key = getAqiKey();
  if (!key) {
    return {
      aqi: zone === 'urban' ? 168 : 92,
      source: 'fallback'
    };
  }

  const { lat, lon } = getZoneContext(zone);
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${key}`;
  const { data } = await axios.get(url, { timeout: 5000 });
  const aqi = Number(data?.data?.aqi ?? 0);

  return {
    aqi: clamp(aqi, 0, 500),
    source: 'waqi',
    raw: {
      city: data?.data?.city?.name,
      dominentpol: data?.data?.dominentpol,
      time: data?.data?.time?.s
    }
  };
}

async function fetchCurfewAlert(zone = 'semi-urban') {
  const endpoint = process.env.CURFEW_ALERT_URL;
  if (!endpoint) {
    return {
      curfew: false,
      source: 'fallback'
    };
  }

  try {
    const { data } = await axios.get(endpoint, {
      params: { zone },
      timeout: 5000
    });

    return {
      curfew: Boolean(data?.curfew || data?.alert || data?.active),
      source: 'external',
      raw: data
    };
  } catch (error) {
    return {
      curfew: false,
      source: 'fallback',
      error: error.message
    };
  }
}

function computeDemandPattern({ zone = 'semi-urban', activePolicies = 0, claimsToday = 0 } = {}) {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const base = zone === 'urban' ? 22 : zone === 'rural' ? 14 : 18;
  const commuteSpike = hour >= 8 && hour <= 11 ? 10 : 0;
  const eveningSpike = hour >= 17 && hour <= 22 ? 14 : 0;
  const weekendShift = day === 0 || day === 6 ? 8 : 0;
  const policyPressure = Math.min(activePolicies / 120, 18);
  const claimsPressure = Math.min(claimsToday * 1.5, 20);

  return clamp(Math.round(base + commuteSpike + eveningSpike + weekendShift + policyPressure + claimsPressure), 0, 100);
}

async function fetchEnvironmentalSnapshot(context = {}) {
  const zone = context.zone || 'semi-urban';
  const [weather, aqi, curfew] = await Promise.all([
    fetchWeatherSnapshot(zone).catch(() => ({ rainfall: 8, temperature: 31, source: 'fallback' })),
    fetchAqiSnapshot(zone).catch(() => ({ aqi: 100, source: 'fallback' })),
    fetchCurfewAlert(zone).catch(() => ({ curfew: false, source: 'fallback' }))
  ]);

  return {
    zone,
    rainfall: weather.rainfall,
    temperature: weather.temperature,
    aqi: aqi.aqi,
    demandDrop: computeDemandPattern(context),
    curfew: curfew.curfew,
    source: {
      weather: weather.source,
      aqi: aqi.source,
      curfew: curfew.source,
      demand: 'pattern-model'
    },
    metadata: {
      weather: weather.raw || null,
      aqi: aqi.raw || null,
      curfew: curfew.raw || null
    },
    observedAt: new Date().toISOString()
  };
}

function detectTrigger(environment) {
  if (environment.curfew) {
    return { type: 'curfew', value: 1, threshold: 1, label: 'Curfew / shutdown' };
  }

  if (environment.rainfall >= 50) {
    return { type: 'rainfall', value: environment.rainfall, threshold: 50, label: 'Heavy rainfall' };
  }

  if (environment.temperature >= 42) {
    return { type: 'temperature', value: environment.temperature, threshold: 42, label: 'Extreme heat' };
  }

  if (environment.aqi >= 300) {
    return { type: 'aqi', value: environment.aqi, threshold: 300, label: 'Poor air quality' };
  }

  if (environment.demandDrop >= 60) {
    return { type: 'demand_drop', value: environment.demandDrop, threshold: 60, label: 'Demand collapse' };
  }

  return null;
}

module.exports = {
  computeDemandPattern,
  detectTrigger,
  fetchAqiSnapshot,
  fetchCurfewAlert,
  fetchEnvironmentalSnapshot,
  fetchWeatherSnapshot,
  getZoneContext
};