// Import mongoose for MongoDB operations
const mongoose = require('mongoose');

// Define the Employee schema
const employeeSchema = new mongoose.Schema({
  // Employee's full name
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  // Contact information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  // Job information
  jobTitle: {
    type: String,
    required: true
  },
  // Reference to Department (foreign key)
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  // Salary information
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  // Date of joining the company
  dateOfJoining: {
    type: Date,
    required: true
  },
  // Location information (Country, State, City)
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  // Address
  address: {
    type: String,
    required: true
  },
  // Self-reference: Supervisor (another employee who supervises this employee)
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  // Employee status
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  // Record creation and update timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field to get full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update the updatedAt timestamp before saving
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtuals are included when converting to JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

// Export the Employee model
module.exports = mongoose.model('Employee', employeeSchema);
