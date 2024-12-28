const mongoose = require('mongoose')
require('dotenv').config();

console.log('Connecting to database..');


mongoose.connect(process.env.MONGO_URL,{
    dbName: process.env.DB_NAME
}).then(
    () => {
        console.log('Connected to database');
    }
).catch((err) => {
    console.log('Error connecting to database ' + err);
})
