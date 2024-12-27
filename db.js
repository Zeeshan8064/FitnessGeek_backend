const { MongoClient, ServerApiVersion } = require('mongodb');
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
mongoose.set('debug', true);

async function run() {
  try {
    console.log('Attempting MongoDB connection...');
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Unexpected error:", err.message);
});
