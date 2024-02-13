const express = require("express");
const User = require("../models/user");
const { comparePassword } = require("../utils/bcryptPass");
const jwt = require("jsonwebtoken");
const { secret_jwt } = require("../config/config");

const router = express.Router();
router.post("/login", async (req, res) => {
  const { email, password, _id } = req.body;

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

    if (user && passwordMatch) {
      const token = jwt.sign(
        { _id: user._id.toString(), email: user.email },
        secret_jwt,
        { expiresIn: "1D" }
      );

      user.token = token;
      user.password = undefined;

      res.status(200).json({ user });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
