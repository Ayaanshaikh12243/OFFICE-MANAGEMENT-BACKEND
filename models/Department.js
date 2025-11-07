// Import mongoose for MongoDB operations
const mongoose = require('mongoose');

// Define the Department schema
const departmentSchema = new mongoose.Schema({
  // Department name (must be unique)
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Department description
  description: {
    type: String,
    required: true
  },
  
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  // Number of employees in this department (calculated field)
  employeeCount: {
    type: Number,
    default: 0
  },
  // Department creation date
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Last update date
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export the Department model
module.exports = mongoose.model('Department', departmentSchema);
