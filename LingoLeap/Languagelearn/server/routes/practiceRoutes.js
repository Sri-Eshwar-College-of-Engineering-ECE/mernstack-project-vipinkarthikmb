const express = require("express");
const Question = require("../models/practiceQuestionSchema");

const router = express.Router();


router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; 
  try {
    const questions = await Question.find().limit(limit);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { question, options, answer } = req.body;
    const newQuestion = new Question({ question, options, answer });
    await newQuestion.save();
    res.status(201).json({ message: "Question added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
