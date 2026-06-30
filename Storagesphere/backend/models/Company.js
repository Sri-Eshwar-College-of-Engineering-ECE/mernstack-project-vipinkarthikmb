const mongoose = require('mongoose')

const companySchema = new mongoose.Schema(
	{
		company_name: {
			type: String,
			required: true,
			trim: true,
		},
		industry_type: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	},
)

module.exports = mongoose.model('Company', companySchema)
