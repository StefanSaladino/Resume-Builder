const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { ensureAuthenticated } = require("../middleware/enforceAuth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Nodemailer setup using SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  auth: {
    user: "apikey",
    pass: process.env.API_PASSWORD, // Your SendGrid API key as the password
  },
});

/**
 * Function to send a verification email
 */
function sendVerificationEmail(email, userId) {
  const token = jwt.sign({ id: userId }, "ourSecretKey", { expiresIn: "10m" });

  // Log the email being sent to
  console.log("Sending verification email to:", email);

  const mailConfigurations = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Email Verification",
    text: `Hi! Please follow the link to verify your email: http://localhost:4200/backend/verify/${token} Thanks.`,
  };

  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return;
    }
    console.log("Verification email sent:", info.response);
  });
}

// Registration route
router.post("/register", (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  const newUser = new User({ email, firstName, lastName, isVerified: false });

  User.register(newUser, password, (err, user) => {
    if (err) {
      console.error("Registration error:", err);
      return res.status(500).send(err.message);
    }

    console.log(`Successfully registered user: ${email}`);
    sendVerificationEmail(email, user._id); // Send verification email

    res
      .status(200)
      .json({ message: "Registered successfully! Please verify your email." });
  });
});

// Email verification route
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, "ourSecretKey"); // Verify JWT
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.isVerified = true;
    await user.save();

    res.status(200).send("Email verified successfully!");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid or expired token");
  }
});

// GET login
router.get("/login", (req, res, next) => {
  let messages = req.session.messages || [];
  req.session.messages = [];
  res.render("login", {
    title: "Login to your account",
    messages: messages,
  });
});

// Login route (POST)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
      // Generate JWT
      const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
        expiresIn: "1h",
      });
      return res.json({ success: true, user: user, token: token }); // Send token with response
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Pass error to error-handling middleware
    }

    // Clear the session (optional but ensures everything is cleared)
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      // Send success response to the frontend
      res.status(200).json({ message: "Logout successful" });
    });
  });
});

router.get("/user", (req, res) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user); // Return the user object
  } else {
    return res.status(200).json(null); // Return null if not authenticated
  }
});

module.exports = router;
