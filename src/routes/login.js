const express = require("express");
const User = require("../models/user");
const { comparePassword } = require("../utils/bcryptPass");

const router = express.Router();
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password 😥" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { email: user.email, _id: user.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
