const express = require('express')
const {
	getHistoricalReadings,
	getLatestReading,
	predictSpoilageBatchFromCsv,
	predictSpoilage,
	uploadSensorData,
} = require('../controllers/sensorController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.post('/upload', uploadSensorData)
router.post('/predict', predictSpoilage)
router.post('/predict/csv', predictSpoilageBatchFromCsv)
router.get('/latest/:storageId', getLatestReading)
router.get('/history/:storageId', getHistoricalReadings)

module.exports = router
