const mongoose = require('mongoose');


const scanSchema = new mongoose.Schema({
  tag: { type: String },
  box: { type: String, default: 'Unknown' },
  status: { type: String, default: 'Scanned' },
  timestamp: { type: Date, required: true },
  time: { type: String }, // Time string for display (e.g., "02:55:24")
  section: { type: String, required: true }, // Warehouse, Packaging, Finished, Dispatched
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
