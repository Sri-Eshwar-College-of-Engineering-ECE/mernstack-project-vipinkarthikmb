const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema(
	{
		storage_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'StorageUnit',
			required: true,
			index: true,
		},
		message: {
			type: String,
			required: true,
			trim: true,
		},
		severity: {
			type: String,
			enum: ['low', 'medium', 'high'],
			required: true,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	},
)

module.exports = mongoose.model('Alert', alertSchema)
