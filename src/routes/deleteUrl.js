const express = require("express");
const Url = require("../models/url");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../service/auth");
const { secret_jwt } = require("../config/config");

const router = express.Router();

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const decodedToken = jwt.verify(req.headers["authorization"], secret_jwt);
    const userId = decodedToken._id;

    const url = await Url.findOne({ _id: id, user: userId });

    if (!url) {
      return res.status(404).json({
        message: "URL not found or you are not authorized to delete it.",
        status: 404,
      });
    }

    // If URL found and belongs to user, delete it.
    const deletedUrl = await Url.findByIdAndDelete(id);

    if (!deletedUrl) {
      return res.status(400).json({ message: "URL not found!", status: 400 });
    }

    // Respond with success message
    res.status(200).json({
      message: "URL has been successfully deleted.",
      status: 200,
    });
  } catch (error) {
    // Handle errors
    console.error("Error occurred while deleting URL:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized", status: 401 });
    }
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: 500 });
  }
});

module.exports = router;
