const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const pythonPath = process.env.PYTHON_PATH || path.join(__dirname, 'venv', 'Scripts', 'python.exe'); // Adjust if necessary

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://harassmentdetector.netlify.app']  // Production URL
  : ['http://localhost:3001', 'http://localhost:5000', 'https://harassmentdetector.netlify.app']; // Allow localhost and production URL

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Video Storage Configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const videoDir = path.join(__dirname, 'backend', 'uploads', 'video_files');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp to ensure unique filenames
  }
});

// Video File Upload Configuration
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max file size 50 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/x-matroska', 'video/avi']; // Extend as needed
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only MP4, MKV, and AVI are allowed.'));
    }
    cb(null, true);
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
  });

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Video Upload and Analysis Endpoint
app.post('/api/upload-video', videoUpload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  const videoPath = path.join(__dirname, 'backend', 'uploads', 'video_files', req.file.filename);

  // Execute Python script to analyze the video
  exec(`"${pythonPath}" backend/utils/videoAnalysis.py "${videoPath}"`, (error, stdout, stderr) => {
    let deleted = false;

    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).json({ message: 'Error processing video', error: error.message });
    }

    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
      return res.status(500).json({ message: 'Error processing video', error: stderr.trim() });
    }

    const output = stdout.trim().split('\n');
    if (output.length < 3) {
      return res.status(500).json({ message: 'Error: Unexpected Python output format' });
    }

    const result = output[0];
    const harassmentConfidence = parseFloat(output[1].split(":")[1].trim());
    const nonHarassmentConfidence = parseFloat(output[2].split(":")[1].trim());

    if (isNaN(harassmentConfidence) || isNaN(nonHarassmentConfidence)) {
      return res.status(500).json({ message: 'Error: Invalid confidence values in Python output' });
    }

    res.json({
      message: result,
      harassmentConfidence: harassmentConfidence,
      nonHarassmentConfidence: nonHarassmentConfidence
    });

    // Delete video after processing or error
    if (!deleted) {
      fs.unlink(videoPath, (err) => {
        if (err) {
          console.error('Error deleting video file:', err);
        } else {
          console.log(`Deleted video file: ${videoPath}`);
        }
      });
      deleted = true;
    }
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
