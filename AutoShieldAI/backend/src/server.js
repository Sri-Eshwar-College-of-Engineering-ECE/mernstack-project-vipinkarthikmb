require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, limit: 180 }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/policy',   require('./routes/policy'));
app.use('/api/claims',   require('./routes/claims'));
app.use('/api/triggers', require('./routes/triggers'));
app.use('/api/live',     require('./routes/live'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'AutoShield Backend' }));

const { startTriggerScheduler } = require('./services/triggerEngine');
module.exports = app;

if (require.main === module) {
	startTriggerScheduler();

	const PORT = process.env.PORT || 5000;
	const server = app.listen(PORT, () => console.log(`🚀 Firebase-ready server running on port ${PORT}`));
	server.on('error', (error) => {
		if (error?.code === 'EADDRINUSE') {
			console.error(`⚠️ Port ${PORT} is already in use. Another backend instance is already running.`);
			return;
		}

		console.error('Backend startup failed:', error.message);
	});
}
