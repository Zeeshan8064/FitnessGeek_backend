const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to database...');

(async () => {
  try {
    // Ensure URL uses srv format
    const MONGO_URL = process.env.MONGO_URL.includes('mongodb+srv://') 
      ? process.env.MONGO_URL
      : process.env.MONGO_URL.replace('mongodb://', 'mongodb+srv://');

    const conn = await mongoose.connect(MONGO_URL, {
      dbName: process.env.DB_NAME,
      directConnection: false,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Connection error:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    process.exit(1);
  }
})();
