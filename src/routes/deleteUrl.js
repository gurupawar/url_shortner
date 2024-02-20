const express = require("express");
const Url = require("../models/url");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../service/auth");
const { secret_jwt } = require("../config/config");

const router = express.Router();

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const token = req.headers["authorization"];
  const decode = jwt.verify(token, secret_jwt);
  console.log(decode._id);
  console.log(id);

  try {
    const urls = await Url.find({ user: decode._id });

    console.log(urls);
    const deletedUrl = await Url.findByIdAndDelete(id);

    if (!deletedUrl) {
      return res.status(400).json({ message: "Url not found!", status: 400 });
    } else {
      res.status(200).json({
        message: "URL has been successfully deleted 🥲",
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error occurred while deleting URL:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: 500 });
  }
});
module.exports = router;
