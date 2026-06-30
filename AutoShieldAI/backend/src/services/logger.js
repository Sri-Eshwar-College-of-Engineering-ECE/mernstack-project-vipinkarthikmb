function buildLog(level, message, context = {}) {
  return {
    severity: level,
    message,
    timestamp: new Date().toISOString(),
    service: 'autoshield-functions',
    ...context
  };
}

function logInfo(message, context = {}) {
  console.log(JSON.stringify(buildLog('INFO', message, context)));
}

function logWarn(message, context = {}) {
  console.warn(JSON.stringify(buildLog('WARNING', message, context)));
}

function logError(message, error, context = {}) {
  console.error(JSON.stringify(buildLog('ERROR', message, {
    ...context,
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    }
  })));
}

module.exports = {
  logError,
  logInfo,
  logWarn
};