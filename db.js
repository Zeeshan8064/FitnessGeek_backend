const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();  // Make sure to load environment variables

// Use environment variables for sensitive data like the MongoDB URI
const uri = process.env.MONGO_URL;  // For example: mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
mongoose.set('debug', true);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('Attempting MongoDB connection...');

    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}

run().catch((err) => {
  console.error("Unexpected error:", err.message);
});
