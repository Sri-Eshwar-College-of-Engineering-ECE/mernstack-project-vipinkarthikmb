require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const practiceRoutes = require("./routes/practiceRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); 

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Failed:', err));

  
app.use("/api/practice-questions", practiceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/feedback", feedbackRoutes);

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', UserSchema);

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, user: { name, email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Signup failed' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
