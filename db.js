const mongoose = require('mongoose');
const net = require('net');
require('dotenv').config();

console.log('Connecting to database...');

const testMongoDBConnection = () => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(27017, 'cluster0-shard-00-01.kuy7b.mongodb.net', () => {
      console.log('Port 27017 is accessible');
      client.destroy();
      resolve();
    });
    client.on('error', (err) => {
      console.error('Port test failed:', err.message);
      reject(err);
    });
  });
};

(async () => {
  try {
    await testMongoDBConnection();
    
    // Log connection details
    console.log('Attempting connection with:', {
      url: process.env.MONGO_URL?.split('@')[1] || 'URL not found',
      dbName: process.env.DB_NAME || 'DB_NAME not found'
    });

    mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 60000,
    })
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.error('Connection error details:', {
          name: err.name,
          code: err.code,
          message: err.message
        });
      });
  } catch (error) {
    console.error('Skipping MongoDB connection attempt due to port test failure.');
  }
})();
