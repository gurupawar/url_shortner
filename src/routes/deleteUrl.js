const express = require("express");
const Url = require("../models/url");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../service/auth");
const { secret_jwt } = require("../config/config");

const router = express.Router();

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.body;

  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, secret_jwt);

    if (decoded._id === userId) {
      const deletedUrl = await Url.findByIdAndDelete(id);

      if (!deletedUrl) {
        return res.status(400).json({ message: "Url not found!", status: 400 });
      } else {
        res.status(200).json({
          message: "URL has been successfully deleted 🥲",
          status: 200,
        });
      }
    } else {
      return res.status(403).json({
        message: "You are not authorized to delete this URL",
        status: 403,
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
