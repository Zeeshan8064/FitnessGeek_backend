const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URL;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME,
  serverSelectionTimeoutMS: 10000000, // 10000 seconds
};

console.log('Testing MongoDB connection...');
mongoose.connect(uri, options)
  .then(() => {
    console.log('MongoDB connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
