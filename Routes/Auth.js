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

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    console.log("Password provided:", password.trim());
    console.log("Stored hash from DB:", user.password);

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "50m" });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "100d" });

    res.clearCookie("authToken");
    res.clearCookie("refreshToken");

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.status(200).json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    next(err);
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



router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json(createResponse(false, "Email already exists"));
    }

    // Hash the password
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    console.log("Hashed password (to be saved):", hashedPassword);

    const newUser = new User({
      name,
      password: hashedPassword,
      email: normalizedEmail,
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

    await newUser.save();
    res.status(201).json(createResponse(true, "User registered successfully"));
  } catch (err) {
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
