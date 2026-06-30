const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const morgan = require('morgan')

const connectDB = require('./config/db')
const { errorHandler, notFound } = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const alertRoutes = require('./routes/alerteRoutes')
const sensorRoutes = require('./routes/sensorRoutes')
const storageRoutes = require('./routes/storageRoutes')
const contactRoutes = require('./routes/contactRoutes')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
	app.use(morgan('dev'))
}

app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		service: 'StorageSphere Backend API',
		version: '1.0.0',
		endpoints: {
			health: '/api/health',
			auth: '/api/auth',
			storage: '/api/storage',
			sensor: '/api/sensor',
			alerts: '/api/alerts',
			contact: '/api/contact',
		},
		timestamp: new Date().toISOString(),
	})
})

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		service: 'StorageSphere API',
		timestamp: new Date().toISOString(),
	})
})

app.use('/api/auth', authRoutes)
app.use('/api/storage', storageRoutes)
app.use('/api/sensor', sensorRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/contact', contactRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const bootstrap = async () => {
	try {
		await connectDB()
		app.listen(PORT, () => {
			console.log(`StorageSphere backend running on port ${PORT}`)
		})
	} catch (error) {
		console.error('Failed to start server:', error.message)
		process.exit(1)
	}
}

bootstrap()
