
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  jobType: String,
  price: String,
  dueDate: Date,
  company: String,
  duration: String,
  dealer: String,
  status: String,         
  assignedTo: String,     
});

module.exports = mongoose.model('Project', projectSchema);
