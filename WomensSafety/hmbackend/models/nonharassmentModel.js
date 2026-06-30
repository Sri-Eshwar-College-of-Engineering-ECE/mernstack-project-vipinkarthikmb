const mongoose = require('mongoose');

const nonHarassmentSchema = new mongoose.Schema({
  label: { type: String, required: true },
  confidence: { type: Number, required: true },
});

module.exports = mongoose.model('NonHarassment', nonHarassmentSchema);
