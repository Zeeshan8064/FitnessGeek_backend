const express = require("express");
const router = express.Router();
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

router.post('/addcalorieintake', authTokenHandler, async (req, res) => {
  const { item, date, quantity, quantityType } = req.body;
  if (!item || !date || !quantity || !quantityType) {
      return res.status(400).json(createResponse(false, 'Please provide all the details'));
  }

  let qtyingrams = 0;
  if (quantityType === 'g') {
      qtyingrams = Number(quantity);
  } else if (quantityType === 'kg') {
      qtyingrams = Number(quantity) * 1000;
  } else if (quantityType === 'ml') {
      qtyingrams = Number(quantity);
  } else if (quantityType === 'l') {
      qtyingrams = Number(quantity) * 1000;
  } else {
      return res.status(400).json(createResponse(false, 'Invalid quantity type'));
  }

  var query = item;
  request.get({
      url: 'https://api.calorieninjas.com/v1/nutrition?query=' + query,
      headers: {
          'X-Api-Key': process.env.NUTRITION_API_KEY,
      },
  }, async function (error, response, body) {
      if (error) {
          console.error('Request failed:', error);
          return res.status(500).json(createResponse(false, 'Internal server error'));
      }
      else if (response.statusCode != 200) {
          console.error('Error:', response.statusCode, body.toString('utf8'));
          return res.status(500).json(createResponse(false, 'Error from Nutrition API'));
      }
      else {
          try {
              body = JSON.parse(body);
              console.log('API Response:', body); // Debug log to check the response

              // Check if items array is valid and contains data
              if (!Array.isArray(body.items) || body.items.length === 0) {
                  return res.status(400).json(createResponse(false, 'No data available for the requested item'));
              }

              const nutritionData = body.items[0]; // Access the first item in the items array

              // Validate the required fields in the response
              if (typeof nutritionData.calories !== 'number' || typeof nutritionData.serving_size_g !== 'number' ||
                  isNaN(nutritionData.calories) || isNaN(nutritionData.serving_size_g)) {
                  return res.status(400).json(createResponse(false, 'Invalid data from nutrition API'));
              }

              // Calculate calorie intake
              let calorieIntake = (nutritionData.calories / nutritionData.serving_size_g) * qtyingrams;

              if (isNaN(calorieIntake) || !isFinite(calorieIntake) || calorieIntake <= 0) {
                  return res.status(400).json(createResponse(false, 'Invalid calorie intake calculated'));
              }

              const userId = req.userId;
              const user = await User.findOne({ _id: userId });
              user.calorieIntake.push({
                  item,
                  date: new Date(date),
                  quantity,
                  quantityType,
                  calorieIntake: Math.round(calorieIntake) // Optional: round to an integer
              });

              await user.save();
              res.json(createResponse(true, 'Calorie intake added successfully'));
          } catch (parseError) {
              console.error('Error parsing API response:', parseError);
              return res.status(500).json(createResponse(false, 'Internal server error while processing API response'));
          }
      }
  });
});


router.post('/getcalorieintakebydate', authTokenHandler, async (req, res) => {
  const { date } = req.body;
  const userId = req.userId;
  const user = await User.findById({ _id: userId });
  if (!date) {
      let date = new Date();
      user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);

      return res.json(createResponse(true, 'Calorie intake for today', user.calorieIntake));
  }
  user.calorieIntake = filterEntriesByDate(user.calorieIntake, new Date(date));
  res.json(createResponse(true, 'Calorie intake for the date', user.calorieIntake));

})

// Helper function for filtering entries by date
function filterEntriesByDate(calorieIntakeArray, date) {
  return calorieIntakeArray.filter(entry => {
      // Normalize the date stored in the entry
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      console.log("Entry Date:", entryDate, "Date:", date);

      return entryDate.getTime() === date.getTime();
  });
}

router.post("/getcalorieintakebylimit", authTokenHandler, async (req, res) => {
  const { limit } = req.body;
  const userID = req.userId;
  const user = await User.findOne({ _id: userID });

  if (!limit) {
      return res.status(400).json(createResponse(false, "Please provide a limit"));
  } else if (limit === 'all') {
      return res.json(createResponse(true, "Calorie intake", user.calorieIntake));
  } else {
      let date = new Date();
      let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

      // Debug log to check the currentDate value
      console.log("Current Date (Limit applied):", new Date(currentDate));

      // Debug log to print all calorie intake dates
      console.log("All Calorie Intake Dates:", user.calorieIntake.map(item => item.date));

      // Filter the calorie intake array
      user.calorieIntake = user.calorieIntake.filter((item) => {
          console.log("Item Date:", new Date(item.date).getTime(), "Current Date:", currentDate);
          return new Date(item.date).getTime() >= currentDate;
      });

      // Debug log to check the filtered results
      console.log("Filtered Calorie Intake:", user.calorieIntake);

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

    user.calorieIntake = user.calorieIntake.filter((entry) => {
        return entry.date.toString() !== new Date(date).toString();
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
