import Feedback from '../models/Feedback.js';

export const submitFeedback = async (req, res) => {
  let { email, feedback } = req.body;

  if (!email || !feedback) {
    return res.status(400).json({ error: 'Email and feedback are required.' });
  }

  email = email.trim().toLowerCase();
  feedback = feedback.trim();

  try {
    const newFeedback = new Feedback({ email, feedback });
    const savedFeedback = await newFeedback.save();
    return res.status(201).json({ message: 'Feedback submitted successfully.', id: savedFeedback._id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({ error: 'Server error while saving feedback.' });
  }
};
