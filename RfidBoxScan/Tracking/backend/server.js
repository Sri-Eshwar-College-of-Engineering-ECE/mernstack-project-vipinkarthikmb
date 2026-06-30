const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');
const firebaseRoutes = require('./routes/firebase');

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/firebase', firebaseRoutes);

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');

  // Start Firebase auto-sync
  const firebaseService = require('./services/firebaseService');
  firebaseService.startAutoSync(2); // Sync every 2 minutes

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err));
