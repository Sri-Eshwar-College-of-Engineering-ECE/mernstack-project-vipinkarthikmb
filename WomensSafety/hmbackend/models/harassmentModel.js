const mongoose = require('mongoose');

const harassmentSchema = new mongoose.Schema({
  label: { type: String, required: true },
  confidence: { type: Number, required: true },
});

module.exports = mongoose.model('Harassment', harassmentSchema);
