const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  name: { type: String, required: true },
  points: { type: Number, required: true },
  emoji: { type: String, required: true },
});

module.exports = mongoose.model("Leaderboard", LeaderboardSchema);
