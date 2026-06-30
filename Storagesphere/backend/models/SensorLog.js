const mongoose = require('mongoose')

const sensorLogSchema = new mongoose.Schema(
	{
		storage_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'StorageUnit',
			required: true,
			index: true,
		},
		temperature: {
			type: Number,
			required: true,
		},
		humidity: {
			type: Number,
			required: true,
		},
		timestamp: {
			type: Date,
			required: true,
			default: Date.now,
			index: true,
		},
	},
	{
		timestamps: true,
	},
)

module.exports = mongoose.model('SensorLog', sensorLogSchema)
