const express = require("express");
const User = require("../models/user");
const { hashPassword } = require("../utils/bcryptPass");
const jwt = require("jsonwebtoken");
const { secret_jwt } = require("../config/config");

const router = express.Router();

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists with the given email or username
  const existingUser = await User.findOne({ email });

  console.log(existingUser);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists 😒" });
  }

  // Hash the user's password before saving it
  const hashedPassword = await hashPassword(password);

  const token = jwt.sign({ email: email }, secret_jwt, {
    expiresIn: "1m",
  });

  const newUser = new User({
    email,
    password: hashedPassword,
    token: token,
  });
  await newUser.save();

  // Respond with the shortened URL
  res.status(201).json({
    message: "Account has been successfully created 🎉",
    token: newUser.token,
    email: newUser.email,
  });
  console.log("user created");
});
module.exports = router;
