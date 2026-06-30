const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/Leaderboard");

router.get("/", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ rank: 1 });
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { rank, name, points, emoji } = req.body;
    if (!rank || !name || !points || !emoji) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const newEntry = new Leaderboard({ rank, name, points, emoji });
    await newEntry.save();
    
    res.status(201).json({ success: true, message: "Leaderboard entry added", data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
