const express = require("express");
const router = express.Router();
const User = require("../Models/UserSchema");
const errorHandler = require("../Middlewares/errorMiddleware");
const authTokenHandler = require("../Middlewares/checkAuthToken");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
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

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    console.log(user);

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json(createResponse(false, "Invalid email or password"));
    }
    // Generate tokens
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '50m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '100d' });

    // Clear any existing tokens
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    // Set cookies for tokens
    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
      sameSite: 'None', // Required for cross-origin requests
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    });

    // Send response
    res.status(200).json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    next(err); // Pass error to the error-handling middleware
  }
});


router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are cleared in production
    sameSite: 'None', // Required for cross-origin requests
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.status(200).json(createResponse(true, "Logged out successfully"));
});



router.post("/register", async (req, res,next) => {
  try {
    const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;

    // Normalize the email by trimming spaces and converting to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json(createResponse(false, "Email already exists"));
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with normalized email
    const newUser = new User({
      name,
      password: hashedPassword,
      email: normalizedEmail, // Save the normalized email
      weight: [
        {
          weight: weightInKg,
          unit: "kg",
          date: Date.now(),
        },
      ],
      height: [
        {
          height: heightInCm,
          date: Date.now(),
          unit: "cm",
        },
      ],
      gender,
      dob,
      goal,
      activityLevel,
    });

    // Save the user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json(createResponse(true, 'User registered successfully'));
  } catch (err) {
    next(err); // Pass any errors to the error-handling middleware
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
