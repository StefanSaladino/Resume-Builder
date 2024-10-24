const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { ensureAuthenticated } = require("../middleware/enforceAuth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
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
    text: `Hi! Please follow the link to verify your email: https://resume-builder-3aba3.web.app/backend/verify/${token} Thanks.`,
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

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication Error: ", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    
    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        message: "User is not verified"
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login Error: ", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({ success: true, user: user, token: token });
    });
  })(req, res, next);
});

    

    // If user is verified, log them in
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
      // Generate JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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

// Resend verification email route (POST)
// Forgot Password Route
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Return a structured error response
      return res.status(400).json({ success: false, message: "User with this email does not exist." });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set reset token and its expiration on the user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Set up email data
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `https://resume-builder-3aba3.web.app/reset-password/${resetToken}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // Send email with the reset token
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error sending email." });
      }
      res.json({ success: true, message: `An e-mail has been sent to ${email} with further instructions.` });
    });
  } catch (error) {
    console.error("Error in reset-password route:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Route to handle the password reset
router.post("/reset-password/:resetToken", async (req, res) => {
  console.log("Received data:", req.body);
  const { password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const user = await User.findOne({
    resetPasswordToken: req.params.resetToken,
    resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
  });

  if (!user) {
    return res.status(400).json({ message: "Password reset token is invalid or has expired." });
  }

  // Set the new password
  await user.setPassword(password);

  // Clear the reset token and expiration
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully." });
});

module.exports = router;
