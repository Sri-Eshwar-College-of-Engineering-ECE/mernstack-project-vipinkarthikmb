const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
			enum: ['Admin', 'Staff'],
			default: 'Staff',
		},
		company_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Company',
			required: true,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	},
)

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) {
		return next()
	}

	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
	next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
