const express = require("express");
const User = require("../models/user");
const { hashPassword } = require("../utils/bcryptPass");
const jwt = require("jsonwebtoken");
const { secret_jwt } = require("../config/config");
const { validationResult } = require("express-validator");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const errors = validationResult(req); // Validate request body
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if the user already exists with the given email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists 😒", status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    const { email: newEmail, _id } = await newUser.save();

    const token = jwt.sign(
      { _id: _id.toString(), email: newEmail },
      secret_jwt,
      {
        expiresIn: "1d",
      }
    );

    // Respond with success message and token
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
