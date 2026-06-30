import express from 'express';
import Feedback from '../models/Feedback.js'; 

const router = express.Router();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post('/', async (req, res) => {
  try {
    let { email, feedback } = req.body;

    if (!email || !feedback) {
      return res.status(400).json({ error: 'Email and feedback are required.' });
    }

    email = email.trim();
    feedback = feedback.trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (feedback.length === 0) {
      return res.status(400).json({ error: 'Feedback cannot be empty.' });
    }

    const newFeedback = new Feedback({ email, feedback });
    await newFeedback.save();

    return res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ error: 'Server error while saving feedback.' });
  }
});

export default router;
