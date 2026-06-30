const StorageUnit = require('../models/StorageUnit')

const createStorageUnit = async (req, res, next) => {
	try {
		const {
			unit_name,
			location,
			capacity,
			temperature_threshold,
			humidity_threshold,
		} = req.body

		if (
			!unit_name ||
			!location ||
			capacity === undefined ||
			temperature_threshold === undefined ||
			humidity_threshold === undefined
		) {
			res.status(400)
			throw new Error('All storage unit fields are required')
		}

		const storageUnit = await StorageUnit.create({
			company_id: req.user.company_id,
			unit_name,
			location,
			capacity,
			temperature_threshold,
			humidity_threshold,
		})

		res.status(201).json(storageUnit)
	} catch (error) {
		next(error)
	}
}

const getStorageUnits = async (req, res, next) => {
	try {
		const units = await StorageUnit.find({ company_id: req.user.company_id }).sort({ createdAt: -1 })
		res.json(units)
	} catch (error) {
		next(error)
	}
}

const getStorageUnitById = async (req, res, next) => {
	try {
		const unit = await StorageUnit.findOne({
			_id: req.params.id,
			company_id: req.user.company_id,
		})

		if (!unit) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		res.json(unit)
	} catch (error) {
		next(error)
	}
}

const updateStorageUnit = async (req, res, next) => {
	try {
		const unit = await StorageUnit.findOne({
			_id: req.params.id,
			company_id: req.user.company_id,
		})

		if (!unit) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		Object.assign(unit, req.body)
		const updated = await unit.save()

		res.json(updated)
	} catch (error) {
		next(error)
	}
}

const deleteStorageUnit = async (req, res, next) => {
	try {
		const deleted = await StorageUnit.findOneAndDelete({
			_id: req.params.id,
			company_id: req.user.company_id,
		})

		if (!deleted) {
			res.status(404)
			throw new Error('Storage unit not found')
		}

		res.json({ message: 'Storage unit deleted successfully' })
	} catch (error) {
		next(error)
	}
}

module.exports = {
	createStorageUnit,
	getStorageUnits,
	getStorageUnitById,
	updateStorageUnit,
	deleteStorageUnit,
}
