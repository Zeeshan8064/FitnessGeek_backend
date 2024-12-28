const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URL;

// Enable Mongoose debugging in development
mongoose.set('debug', true);

const connectToDatabase = async () => {
  try {
    console.log('Attempting MongoDB connection...');
    
    // Use Mongoose to connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    console.log("Successfully connected to MongoDB!");

    // Add a listener for the Mongoose connection
    mongoose.connection.on('connected', () => {
      console.log('Mongoose is connected to the database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose connection disconnected');
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process with failure
  }
};

// Export the connection function for use in your application
module.exports = connectToDatabase;
