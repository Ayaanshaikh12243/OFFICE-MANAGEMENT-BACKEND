const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try MongoDB Atlas first, fallback to local if it fails
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_management_db';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Trying local MongoDB...');
    
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/office_management_db', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
    } catch (localError) {
      console.error(`\nMongoDB Connection Failed!`);
      console.error(`Please ensure MongoDB is running or configure MongoDB Atlas correctly.\n`);
      console.error(`Error: ${localError.message}\n`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
