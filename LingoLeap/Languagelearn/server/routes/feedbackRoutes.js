const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, content } = req.body;

    if (!email || !content) {
      return res.status(400).json({ success: false, message: "Both email and content are required" });
    }

    const newFeedback = new Feedback({ email, content });
    await newFeedback.save();

    res.status(200).json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ success: false, error: "Internal server error while saving feedback" });
  }
});

module.exports = router;
