const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const errorHandler = require('../Middlewares/errorMiddleware');
const request = require('request');
const User = require('../Models/UserSchema');
require('dotenv').config();


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for profile'));
});

router.get('/getprofile', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let today = new Date();

    // get user's name
    let name = user.name;

    //get user's email address
    let email = user.email;

    // get today's weight
    let weight = user.weight[user.weight.length - 1].weight;
    // get today's height
    let height = user.height[user.height.length - 1].height;

    // get user's gender
    let gender = user.gender;

    // get user's d.o.b
    let dob = new Date(user.dob);

    // get goal calorieIntake

    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }

    // get goal weight
    let goalWeight = 22 * ((user.height[user.height.length - 1].height / 100) ** 2);


    // get goal steps
    let goalSteps = 0;
    const { goal } = req.body;
    // If a goal is provided, update it in the database
    if (goal) {
        user.goal = goal.trim();
        await user.save();
    }else{
        goalSteps = 7500;
    }

    const currentGoal = user.goal ? user.goal.trim().toLowerCase() : "";

    if (currentGoal === "weightloss") {
        goalSteps = 10000;
    } else if (currentGoal === "weightgain") {
        goalSteps = 5000;
    }

    let tempResponse = [
        {
            name: "Name",
            value: name
        },
        {
            name: "Email",
            value: email
        },
        {
            name: "Date of Birth",
            value: dob.toISOString().split('T')[0] // Format the date to YYYY-MM-DD
        },
        {
            name: "Gender",
            value: gender
        },
        {
            name: "Current Weight",
            value: weight,
            unit: "kg"
        },
        {
            name: "Height",
            value: height,
            unit: "cm"
        },
        {
            name: "Weight Goal",
            value: user.goal
        },
        {
            name: "Max Calorie Intake",
            value: Math.round(maxCalorieIntake),
            unit: "cal"
        },
        {
            name: "Goal Weight",
            value: Math.round(goalWeight),
            unit: "kg"
        },
        {
            name: "Goal Steps",
            value: goalSteps,
            unit: "steps"
        }
    ];


    res.json(createResponse(true, 'Profile data fetched successfully', tempResponse));
})



module.exports = router;
