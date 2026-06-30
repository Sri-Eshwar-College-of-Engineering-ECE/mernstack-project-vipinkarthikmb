const Alert = require('../models/Alert')
const SensorLog = require('../models/SensorLog')
const StorageUnit = require('../models/StorageUnit')
const { evaluateLogForAlerts } = require('../services/alertService')
const { predictSpoilageBatch, predictSpoilageRisk } = require('../services/aiService')

const uploadSensorData = async (req, res, next) => {
	try {
		const { storage_id, temperature, humidity, timestamp } = req.body

		if (!storage_id || temperature === undefined || humidity === undefined) {
			res.status(400)
			throw new Error('storage_id, temperature and humidity are required')
		}

		const storage = await StorageUnit.findOne({
			_id: storage_id,
			company_id: req.user.company_id,
		})

		if (!storage) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		const sensorLog = await SensorLog.create({
			storage_id,
			temperature,
			humidity,
			timestamp: timestamp ? new Date(timestamp) : new Date(),
		})

		const alerts = await evaluateLogForAlerts({
			storage,
			temperature,
			humidity,
		})

		res.status(201).json({
			sensorLog,
			alertsGenerated: alerts.length,
			alerts,
		})
	} catch (error) {
		next(error)
	}
}

const getLatestReading = async (req, res, next) => {
	try {
		const storage = await StorageUnit.findOne({
			_id: req.params.storageId,
			company_id: req.user.company_id,
		})

		if (!storage) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		const latestReading = await SensorLog.findOne({ storage_id: storage._id }).sort({ timestamp: -1 })

		if (!latestReading) {
			return res.json({ message: 'No sensor data found', data: null })
		}

		const activeAlerts = await Alert.find({ storage_id: storage._id }).sort({ created_at: -1 }).limit(5)

		return res.json({
			storage,
			latestReading,
			activeAlerts,
		})
	} catch (error) {
		return next(error)
	}
}

const getHistoricalReadings = async (req, res, next) => {
	try {
		const { storageId } = req.params
		const { from, to } = req.query

		const storage = await StorageUnit.findOne({
			_id: storageId,
			company_id: req.user.company_id,
		})

		if (!storage) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		const filter = { storage_id: storageId }
		if (from || to) {
			filter.timestamp = {}
			if (from) filter.timestamp.$gte = new Date(from)
			if (to) filter.timestamp.$lte = new Date(to)
		}

		const readings = await SensorLog.find(filter).sort({ timestamp: 1 })
		res.json(readings)
	} catch (error) {
		next(error)
	}
}

const predictSpoilage = async (req, res, next) => {
	try {
		const {
			temperature_C,
			humidity_percent,
			door_open_duration_min,
			door_frequency_per_hour,
			storage_hours,
		} = req.body

		const requiredFields = [
			'temperature_C',
			'humidity_percent',
			'door_open_duration_min',
			'door_frequency_per_hour',
			'storage_hours',
		]

		const hasMissingField = requiredFields.some((field) => req.body[field] === undefined || req.body[field] === null)

		if (hasMissingField) {
			res.status(400)
			throw new Error(`Missing required fields. Required: ${requiredFields.join(', ')}`)
		}

		const prediction = await predictSpoilageRisk({
			temperature_C,
			humidity_percent,
			door_open_duration_min,
			door_frequency_per_hour,
			storage_hours,
		})

		res.json(prediction)
	} catch (error) {
		if (error.response) {
			res.status(error.response.status || 502)
			return next(new Error(error.response.data?.detail || 'AI service returned an error'))
		}

		if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
			res.status(503)
			return next(new Error('AI service is unavailable. Please make sure FastAPI service is running.'))
		}

		return next(error)
	}
}

const predictSpoilageBatchFromCsv = async (req, res, next) => {
	try {
		const { rows } = req.body

		if (!Array.isArray(rows) || rows.length === 0) {
			res.status(400)
			throw new Error('rows is required and must be a non-empty array')
		}

		const normalizedRows = rows.map((row, index) => {
			const parsedRow = {
				temperature_C: Number(row.temperature_C),
				humidity_percent: Number(row.humidity_percent),
				door_open_duration_min: Number(row.door_open_duration_min),
				door_frequency_per_hour: Number(row.door_frequency_per_hour),
				storage_hours: Number(row.storage_hours),
			}

			const hasInvalidValue = Object.values(parsedRow).some((value) => Number.isNaN(value))
			if (hasInvalidValue) {
				res.status(400)
				throw new Error(`Invalid numeric data in row ${index + 1}`)
			}

			return parsedRow
		})

		const predictions = await predictSpoilageBatch(normalizedRows)
		return res.json(predictions)
	} catch (error) {
		if (error.response) {
			res.status(error.response.status || 502)
			return next(new Error(error.response.data?.detail || 'AI service returned an error for batch prediction'))
		}

		if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
			res.status(503)
			return next(new Error('AI service is unavailable. Please make sure FastAPI service is running.'))
		}

		return next(error)
	}
}

module.exports = {
	uploadSensorData,
	getLatestReading,
	getHistoricalReadings,
	predictSpoilage,
	predictSpoilageBatchFromCsv,
}
