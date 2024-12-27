const mongoose = require('mongoose');
require('dotenv').config();

console.log('Attempting MongoDB connection...');

mongoose.set('debug', true);

(async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME,
      maxPoolSize: 10,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    };

    console.log('Connection URL:', process.env.MONGO_URL?.split('@')[1]);
    await mongoose.connect(process.env.MONGO_URL, options);
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose error:', err);
    });

  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
})();
