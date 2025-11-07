// Import mongoose for MongoDB operations
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  // Username for login (must be unique)
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Email address (must be unique)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Hashed password
  password: {
    type: String,
    required: true
  },
  // User role (admin or employee)
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  // Full name of the user
  fullName: {
    type: String,
    required: true
  },
  // Account creation date
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
