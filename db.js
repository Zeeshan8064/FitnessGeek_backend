const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to database...');

(async () => {
  try {
    console.log('Attempting connection with:', {
      url: process.env.MONGO_URL?.split('@')[1] || 'URL not found',
      dbName: process.env.DB_NAME || 'DB_NAME not found'
    });

    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    process.exit(1);
  }
})();
