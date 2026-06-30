const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const mongoose = require('mongoose');
const Harassment = require('../models/harassment');
const NonHarassment = require('../models/nonHarassment');
const router = express.Router();

// Set up multer storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure the 'uploads' folder exists
    }
    cb(null, uploadDir); // Use the 'uploads' folder for storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as filename for uniqueness
  }
});

const upload = multer({ storage: storage });

// Video upload and analysis route
router.post('/upload', upload.single('video'), (req, res) => {
  // Ensure a file is uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  const videoPath = path.join(__dirname, '..', 'uploads', req.file.filename);

  // Call the Python script to analyze the video
  exec(`python3 ./utils/videoAnalysis.py "${videoPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script:', stderr);
      return res.status(500).json({ message: 'Error processing video', error: stderr.trim() });
    }

    // Process Python script output (assuming the output is either "Harassment Detected" or "No Harassment Detected")
    const result = stdout.trim();
    let responseMessage = '';
    let harassmentConfidence = 0;
    let noHarassmentConfidence = 0;

    // Handle results based on the Python output
    if (result === "Harassment Detected") {
      responseMessage = "Harassment Detected";
      harassmentConfidence = 95; // Example value, replace with the actual confidence from the model
      noHarassmentConfidence = 5;

      const newHarassment = new Harassment({
        label: 'Harassment Detected',
        confidence: harassmentConfidence
      });

      newHarassment.save()
        .then(() => {
          res.json({
            message: responseMessage,
            harassmentAccuracy: harassmentConfidence,
            noHarassmentAccuracy: noHarassmentConfidence
          });
        })
        .catch((err) => {
          console.error('Error saving harassment data:', err);
          res.status(500).json({ message: 'Error saving data to database', error: err });
        });
    } else {
      responseMessage = "No Harassment Detected";
      harassmentConfidence = 5; // Example value, replace with the actual confidence from the model
      noHarassmentConfidence = 95;

      const newNonHarassment = new NonHarassment({
        label: 'No Harassment Detected',
        confidence: noHarassmentConfidence
      });

      newNonHarassment.save()
        .then(() => {
          res.json({
            message: responseMessage,
            harassmentAccuracy: harassmentConfidence,
            noHarassmentAccuracy: noHarassmentConfidence
          });
        })
        .catch((err) => {
          console.error('Error saving non-harassment data:', err);
          res.status(500).json({ message: 'Error saving data to database', error: err });
        });
    }

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
