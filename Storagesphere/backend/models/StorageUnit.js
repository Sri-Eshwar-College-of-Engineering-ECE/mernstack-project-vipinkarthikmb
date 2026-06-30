const mongoose = require('mongoose')

const storageUnitSchema = new mongoose.Schema(
	{
		company_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Company',
			required: true,
		},
		unit_name: {
			type: String,
			required: true,
			trim: true,
		},
		location: {
			type: String,
			required: true,
			trim: true,
		},
		capacity: {
			type: Number,
			required: true,
			min: 0,
		},
		temperature_threshold: {
			type: Number,
			required: true,
		},
		humidity_threshold: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('StorageUnit', storageUnitSchema)
