const express = require("express");
const router = express.router();
const authTokenHandler = require("../Middlewares/checkAuthToken");
const jwt = require("jsonwebtoken");
const errorHandler = require("../Middlewares/errorMiddleware");
const request = require("request");
const User = require("../Models/UserSchema");
require("dotenv").config();

function createResponse(ok, message, data) {
  return {
    ok,
    message,
    data,
  };
}

router.get("/test", authTokenHandler, async (req, res) => {
  res.json(
    createResponse(true, "Test API is working for calorie intake report")
  );
});

router.post("/addcalorieintake", authTokenHandler, async (req, res) => {
  const { item, date, quantity, quantitytype } = req.body;
  if (!item || !date || !quantity || !quantitytype) {
    return res
      .status(400)
      .json(createResponse(false, "Missing required fields"));
  }
  let qtyingrams = 0;
  if (quantitytype === "g") {
    qtyingrams = quantity;
  } else if (quantitytype === "kg") {
    qtyingrams = quantity * 1000;
  } else if (quantitytype === "ml") {
    qtyingrams = quantity;
  } else if (quantitytype === "l") {
    qtyingrams = quantity * 1000;
  }

  var query = item;
  request.get(
    {
      url: "https://api.api-ninjas.com/v1/nutrition?query=" + query,
      headers: {
        "X-Api-Key": process.env.NUTRITION_API_KEY,
      },
    },
    async function (error, response, body) {
      if (error) return console.error("Request failed:", error);
      else if (response.statusCode != 200)
        return console.error(
          "Error:",
          response.statusCode,
          body.toString("utf8")
        );
      else {
            // body :[ {
            //     "name": "rice",
            //     "calories": 127.4,
            //     "serving_size_g": 100,
            //     "fat_total_g": 0.3,
            //     "fat_saturated_g": 0.1,
            //     "protein_g": 2.7,
            //     "sodium_mg": 1,
            //     "potassium_mg": 42,
            //     "cholesterol_mg": 0,
            //     "carbohydrates_total_g": 28.4,
            //     "fiber_g": 0.4,
            //     "sugar_g": 0.1
            // }]

            body = JSON.parse(body);
            let calorieIntake = (body[0].calories / body[0].serving_size_g) * parseInt(qtyingrams);
            const user = await User.findOne({ _id: userID});
            user.calorieIntake.push({
                item,
                date:new Date(date),
                quantity,
                quantitytype,
                calorieIntake: parseInt(calorieIntake)
            })
            await user.save();
            res.json(createResponse(true, "Calorie intake added successfully"));
        }
    }
  );
});

router.post("/addcalorieintakebydate",authTokenHandler,async (req, res) => {
    const {date} = req.body;
    const userID = req.userId;
    const user = await User.findOne({ _id: userID});
    if (!date) {
        let date = new Date();
        user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);

        return res.json(createResponse(true, "Calorie intake for today", user.calorieIntake));

    }
});

router.post("/getcalorieintakebylimit",authTokenHandler,async (req, res) => {
    const {limit} = req.body;
    const userID = req.userId;
    const user = await User.findOne({ _id: userID});

    if(!limit) {

        return res.status(400).json(createResponse(false, "Please provide a limit"));

    } else if (limit === 'all') {

        return res.json(createResponse(true, "Calorie intake", user.calorieIntake));

    } else {

        let date = new Date();
        date.setDate(date.getDate() - parseInt(limit));
        user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);

        return res.json(createResponse(true, "Calorie intake for the last " + limit + " days", user.calorieIntake));
    }
});

router.delete("/deletecalorieintake", authTokenHandler, async (req, res) => {

    const {item, date} = req.body;
    if (!item ||!date) {
        return res.status(400).json(createResponse(false, "Please provide item and date"));
    }

    const userID = req.userId;
    const user = await User.findOne({ _id: userID });

    user.calorieIntake = user.calorieIntake.filter((item) => {
        return item.item != item && item.date != date;
    })

    await user.save();
    return res.json(createResponse(true, "Calorie intake deleted successfully"));
});

router.post("/getgoalcaloreintake", authTokenHandler, async (req, res) => {

    const userID = req.userId;
    const user = await User.findOne({ _id: userID});

    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;

    if(gender == 'male'){
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age);
    } else if(gender == 'female'){
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age);
    } else{
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age);
    }

    if(user.goal === 'weightloss'){
        maxCalorieIntake = BMR - 500;

    } else if(user.goal === 'weightgain'){
        maxCalorieIntake = BMR + 500;
    } else{
        maxCalorieIntake = BMR;
    }

    return res.json(createResponse(true, "Your maximum calorie intake goal is " , {maxCalorieIntake}));
});

function filterEntriesByDate(entries, targerDate) {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getDate() === targerDate.getDate() &&
      entryDate.getMonth() === targerDate.getMonth() &&
      entryDate.getFullYear() === targerDate.getFullYear()
    );
  });
}

module.exports = router;
