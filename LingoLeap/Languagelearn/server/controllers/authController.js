const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');

async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    await sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Signup failed. Try again later.' });
  }
}

module.exports = { signup };