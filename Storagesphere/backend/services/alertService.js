const Alert = require('../models/Alert')
const SensorLog = require('../models/SensorLog')

const DEVIATION_WINDOW_MINUTES = 20

const createAlert = async ({ storageId, message, severity }) => {
	return Alert.create({
		storage_id: storageId,
		message,
		severity,
	})
}

const checkContinuousDeviation = async ({ storage }) => {
	const windowStart = new Date(Date.now() - DEVIATION_WINDOW_MINUTES * 60 * 1000)

	const logs = await SensorLog.find({
		storage_id: storage._id,
		timestamp: { $gte: windowStart },
	}).sort({ timestamp: 1 })

	if (!logs.length) {
		return null
	}

	const alwaysOutside = logs.every(
		(entry) =>
			entry.temperature > storage.temperature_threshold ||
			entry.humidity > storage.humidity_threshold,
	)

	if (!alwaysOutside) {
		return null
	}

	return createAlert({
		storageId: storage._id,
		message: `Continuous deviation detected for ${DEVIATION_WINDOW_MINUTES} minutes`,
		severity: 'high',
	})
}

const evaluateLogForAlerts = async ({ storage, temperature, humidity }) => {
	const generatedAlerts = []

	if (temperature > storage.temperature_threshold) {
		generatedAlerts.push(
			await createAlert({
				storageId: storage._id,
				message: `Temperature ${temperature}°C exceeded threshold ${storage.temperature_threshold}°C`,
				severity: temperature - storage.temperature_threshold >= 5 ? 'high' : 'medium',
			}),
		)
	}

	if (humidity > storage.humidity_threshold) {
		generatedAlerts.push(
			await createAlert({
				storageId: storage._id,
				message: `Humidity ${humidity}% exceeded threshold ${storage.humidity_threshold}%`,
				severity: humidity - storage.humidity_threshold >= 10 ? 'high' : 'medium',
			}),
		)
	}

	const continuousDeviationAlert = await checkContinuousDeviation({ storage })
	if (continuousDeviationAlert) {
		generatedAlerts.push(continuousDeviationAlert)
	}

	return generatedAlerts
}

module.exports = {
	evaluateLogForAlerts,
}
