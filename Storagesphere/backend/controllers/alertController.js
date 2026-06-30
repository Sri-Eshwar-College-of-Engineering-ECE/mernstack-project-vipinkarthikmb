const Alert = require('../models/Alert')
const StorageUnit = require('../models/StorageUnit')

const getAlerts = async (req, res, next) => {
	try {
		const { severity } = req.query

		const storageUnits = await StorageUnit.find({ company_id: req.user.company_id }).select('_id unit_name location')
		const storageIds = storageUnits.map((unit) => unit._id)

		const filter = { storage_id: { $in: storageIds } }
		if (severity) {
			filter.severity = severity.toLowerCase()
		}

		const alerts = await Alert.find(filter).sort({ created_at: -1 }).limit(200)

		const storageLookup = storageUnits.reduce((accumulator, unit) => {
			accumulator[String(unit._id)] = unit
			return accumulator
		}, {})

		const response = alerts.map((alert) => ({
			...alert.toObject(),
			storage: storageLookup[String(alert.storage_id)] || null,
		}))

		res.json(response)
	} catch (error) {
		next(error)
	}
}

const getAlertsSummary = async (req, res, next) => {
	try {
		const storageUnits = await StorageUnit.find({ company_id: req.user.company_id }).select('_id')
		const storageIds = storageUnits.map((unit) => unit._id)

		const grouped = await Alert.aggregate([
			{ $match: { storage_id: { $in: storageIds } } },
			{
				$group: {
					_id: '$severity',
					count: { $sum: 1 },
				},
			},
		])

		const summary = { low: 0, medium: 0, high: 0 }
		grouped.forEach((item) => {
			summary[item._id] = item.count
		})

		res.json(summary)
	} catch (error) {
		next(error)
	}
}

module.exports = {
	getAlerts,
	getAlertsSummary,
}
