const mongoose = require('mongoose');
const net = require('net');
require('dotenv').config();

console.log('Connecting to database...');

// Port testing function
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

// Attempt to test port and connect to MongoDB
(async () => {
  try {
    await testMongoDBConnection();

    mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 60000, // Increase timeout for debugging
    })
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.error('Error connecting to database:', err.message);
        console.error(err);
      });

  } catch (error) {
    console.error('Skipping MongoDB connection attempt due to port test failure.');
  }
})();
