const express = require('express')
const { getAlerts, getAlertsSummary } = require('../controllers/alertController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.get('/', getAlerts)
router.get('/summary', getAlertsSummary)

module.exports = router
