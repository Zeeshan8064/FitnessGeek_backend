const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to database...');
console.log('Mongoose version:', mongoose.version);
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('DB_NAME:', process.env.DB_NAME);


mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME,
  serverSelectionTimeoutMS: 60000, // Increase timeout for debugging
})
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Error connecting to database:', err.message);
    console.error(err); // Log the entire error object for debugging
  });
