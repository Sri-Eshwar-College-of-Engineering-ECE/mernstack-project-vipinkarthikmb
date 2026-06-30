const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const router = express.Router();

// Set up multer storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the 'uploads' folder exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename using timestamp
  }
});

const upload = multer({ storage: storage });

// Video upload and analysis route
router.post('/upload', upload.single('video'), (req, res) => {
  // Check if a video file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  const videoPath = path.join(__dirname, '..', 'uploads', req.file.filename);

  // Execute the Python script to analyze the video
  exec(`python3 ./utils/videoAnalysis.py "${videoPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script:', stderr);
      return res.status(500).json({ message: 'Error processing video', error: stderr.trim() });
    }

    // Parse the Python script output
    const output = stdout.trim().split('\n');
    const result = output[0]; // Harassment Detected or No Harassment Detected
    const harassmentConfidence = parseFloat(output[1].split(":")[1].trim()); // Harassment Confidence
    const nonHarassmentConfidence = parseFloat(output[2].split(":")[1].trim()); // Non-Harassment Confidence

    // Save results to the database (optional, based on your requirements)
    const classification = result === "Harassment Detected" ? 'harassment' : 'nonHarassment';

    // You could save these to a database or log them based on classification
    // Example: Save to a collection (use your own DB interaction here)
    // const newRecord = new YourModel({ classification, result, harassmentConfidence, nonHarassmentConfidence });
    // newRecord.save()...

    // Respond with the result and confidence values
    res.json({
      message: result,
      harassmentConfidence: harassmentConfidence,
      nonHarassmentConfidence: nonHarassmentConfidence
    });

    // Clean up: Delete the uploaded video file after processing
    fs.unlink(videoPath, (err) => {
      if (err) {
        console.error('Error deleting video file:', err);
      } else {
        console.log(`Deleted video file: ${videoPath}`);
      }
    });
  });
});

module.exports = router;
