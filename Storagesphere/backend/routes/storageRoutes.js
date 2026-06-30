const express = require('express')
const {
	createStorageUnit,
	deleteStorageUnit,
	getStorageUnitById,
	getStorageUnits,
	updateStorageUnit,
} = require('../controllers/storageController')
const { authorizeRoles, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.route('/').get(getStorageUnits).post(authorizeRoles('Admin'), createStorageUnit)

router
	.route('/:id')
	.get(getStorageUnitById)
	.put(authorizeRoles('Admin'), updateStorageUnit)
	.delete(authorizeRoles('Admin'), deleteStorageUnit)

module.exports = router
