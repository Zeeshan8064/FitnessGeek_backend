const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const cookieParser = require('cookie-parser');

const authRoutes = require('./api/Auth');
const calorieIntakeRoutes = require('./api/CalorieIntake');
const adminRoutes = require('./api/Admin');
const imageUploadRoutes = require('./api/imageUploadRoutes');
const sleepTrackRoutes = require('./api/SleepTrack');
const stepTrackRoutes = require('./api/StepTrack');
const weightTrackRoutes = require('./api/WeightTrack');
const waterTrackRoutes = require('./api/WaterTrack');
const workoutRoutes = require('./api/WorkoutPlans');
const reportRoutes = require('./api/Report');
const profileRoutes = require('./api/Profile');


require('dotenv').config();
require('./db')

app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000','http://localhost:3001','https://fit-geek-admin.vercel.app/'];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow credentials
    })
);
app.use(cookieParser());



app.use('/auth', authRoutes);
app.use('/calorieintake', calorieIntakeRoutes);
app.use('/admin', adminRoutes);
app.use('/image-upload', imageUploadRoutes);
app.use('/sleeptrack', sleepTrackRoutes);
app.use('/steptrack', stepTrackRoutes);
app.use('/weighttrack', weightTrackRoutes);
app.use('/watertrack', waterTrackRoutes);
app.use('/workoutplans', workoutRoutes);
app.use('/report', reportRoutes);
app.use('/profile', profileRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'The API is working' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
