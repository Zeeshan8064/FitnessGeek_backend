const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to database...');

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});

(async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL.replace(
      'mongodb+srv://',
      'mongodb://'
    );

    console.log('Connection URL type:', { 
      original: process.env.MONGO_URL?.split('@')[1],
      modified: MONGO_URL.split('@')[1]
    });

    const conn = await mongoose.connect(MONGO_URL, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
})();
