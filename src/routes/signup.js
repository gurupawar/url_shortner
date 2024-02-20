const express = require("express");
const User = require("../models/user");
const { hashPassword } = require("../utils/bcryptPass");
const jwt = require("jsonwebtoken");
const { secret_jwt } = require("../config/config");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user already exists with the given email or username
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists 😒", status: 400 });
    }

    // Hash the user's password before saving it
    const hashedPassword = await hashPassword(password);

    const token = jwt.sign({ email: email }, secret_jwt, {
      expiresIn: "1D",
    });

    // Respond with the shortened URL
    res.status(201).json({
      message: "Account has been successfully created 🎉",
      token: token,
      status: 201,
    });
  } catch (error) {
    console.error("Error occurred during signup:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: 500 });
  }
});
module.exports = router;
