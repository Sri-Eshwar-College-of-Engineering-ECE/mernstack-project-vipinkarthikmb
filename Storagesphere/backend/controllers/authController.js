const Company = require('../models/Company')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const sanitizeUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	company_id: user.company_id,
	created_at: user.created_at,
})

const registerCompany = async (req, res, next) => {
	try {
		const {
			company_name,
			industry_type,
			admin_name,
			admin_email,
			admin_password,
		} = req.body

		if (!company_name || !industry_type || !admin_name || !admin_email || !admin_password) {
			res.status(400)
			throw new Error('All registration fields are required')
		}

		const existingUser = await User.findOne({ email: admin_email.toLowerCase() })
		if (existingUser) {
			res.status(409)
			throw new Error('Admin email already in use')
		}

		const company = await Company.create({
			company_name,
			industry_type,
		})

		const adminUser = await User.create({
			name: admin_name,
			email: admin_email,
			password: admin_password,
			role: 'Admin',
			company_id: company._id,
		})

		const token = generateToken({
			userId: adminUser._id,
			companyId: company._id,
			role: adminUser.role,
		})

		res.status(201).json({
			token,
			user: sanitizeUser(adminUser),
			company,
		})
	} catch (error) {
		next(error)
	}
}

const loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			res.status(400)
			throw new Error('Email and password are required')
		}

		const user = await User.findOne({ email: email.toLowerCase() })
		if (!user) {
			res.status(401)
			throw new Error('Invalid credentials')
		}

		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid) {
			res.status(401)
			throw new Error('Invalid credentials')
		}

		const token = generateToken({
			userId: user._id,
			companyId: user.company_id,
			role: user.role,
		})

		res.json({
			token,
			user: sanitizeUser(user),
		})
	} catch (error) {
		next(error)
	}
}

const getProfile = async (req, res) => {
	res.json({ user: req.user })
}

module.exports = {
	registerCompany,
	loginUser,
	getProfile,
}
