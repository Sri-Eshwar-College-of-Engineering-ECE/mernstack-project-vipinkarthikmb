const express = require('express')
const { getProfile, loginUser, registerCompany } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerCompany)
router.post('/login', loginUser)
router.get('/profile', protect, getProfile)

module.exports = router
