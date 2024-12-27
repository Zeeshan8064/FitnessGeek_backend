const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 8000;
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routes/Auth');
const calorieIntakeRoutes = require('./Routes/CalorieIntake');
const adminRoutes = require('./Routes/Admin');
const imageUploadRoutes = require('./Routes/imageUploadRoutes');
const sleepTrackRoutes = require('./Routes/SleepTrack');
const stepTrackRoutes = require('./Routes/StepTrack');
const weightTrackRoutes = require('./Routes/WeightTrack');
const waterTrackRoutes = require('./Routes/WaterTrack');
const workoutRoutes = require('./Routes/WorkoutPlans');
const reportRoutes = require('./Routes/Report');
const profileRoutes = require('./Routes/Profile');


require('dotenv').config();
require('./db')

app.use(bodyParser.json());

app.use(
    cors({
        origin: '*',
        credentials: true, // Allow credentials
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'], // Specify allowed headers
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
