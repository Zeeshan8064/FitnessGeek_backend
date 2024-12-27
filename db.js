const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URL + `${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.log('Error connecting to database: ' + err);
    });
