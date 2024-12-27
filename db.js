const mongoose = require('mongoose');
const net = require('net');
require('dotenv').config();

console.log('Connecting to database...');

const testMongoDBConnection = () => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const timeout = setTimeout(() => {
      client.destroy();
      reject(new Error('Port test timeout after 5000ms'));
    }, 5000);

    client.connect(27017, 'cluster0-shard-00-01.kuy7b.mongodb.net', () => {
      clearTimeout(timeout);
      console.log('Port 27017 is accessible');
      client.destroy();
      resolve();
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Port test failed:', err.message);
      reject(err);
    });
  });
};

(async () => {
  try {
    await testMongoDBConnection();
    
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
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();
