var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require("../middleware/enforceAuth");
const { verifyToken } = require("../middleware/tokenVerifier");
const User = require("../models/user");

/* GET home page. */
router.get('/landing-page', ensureAuthenticated, verifyToken, async function(req, res, next) {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if resume.basicInfo exists
    if (user.email) {
      res.status(200).json(user.email);
    } else {
      res.status(200).json({ message: "User info found", data: null });
    }
  } catch (error) {
    
    res.status(500).json({ message: "Error retrieving user info" });
  }
});

module.exports = router;
