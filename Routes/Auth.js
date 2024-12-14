const express = require("express");
const router = express.Router();
const User = require("../Models/UserSchema");
const errorHandler = require("../Middlewares/errorMiddleware");
const authTokenHandler = require("../Middlewares/checkAuthToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.get("/test", async (req, res) => {
  res.json({
    message: "Auth API is working",
  });
});

function createResponse(ok, message, data) {
  return {
    ok,
    message,
    data,
  };
}



router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    console.log(user);
    if (!user) {
      return res.status(400).json(createResponse(false, "user not found"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json(createResponse(false, "Invalid email or password"));
    }

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '50m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '100m' });

    res.cookie('authToken', authToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    res.status(200).json(createResponse(true, 'Logged in successfully', {
      authToken,
      refreshToken
    }));
  } catch (err) {
    next(err); // Make sure next is included here for error-handling middleware
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { httpOnly: true });
  res.clearCookie("refreshToken", { httpOnly: true });
  res.status(200).json(createResponse(true, "Logged out successfully"));
});

router.post("/register", async (req, res) => {
  try {
    const {name,email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel} = req.body;
    const existingUser = await User.findOne({email: email});

    if (existingUser) {
      return res.status(409).json(createResponse(false, "Email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        password: hashedPassword,
        email,
        weight: [
            {
                weight: weightInKg,
                unit: "kg",
                date: Date.now()
            }
        ],
        height: [
            {
                height: heightInCm,
                date: Date.now(),
                unit: "cm"
            }
        ],
        gender,
        dob,
        goal,
        activityLevel
    });
    await newUser.save();

    res.status(201).json(createResponse(true, 'User registered successfully'));
  }
  catch (err) {
    next(err);
  }
});

router.post("/checklogin", authTokenHandler ,async (req, res) => {
    res.json({
        ok: true,
        message: "User is authenticated"
    })
});


router.use(errorHandler);
module.exports = router;