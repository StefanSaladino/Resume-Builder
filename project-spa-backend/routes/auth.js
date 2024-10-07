const express = require('express');
const passport = require('passport');
const User = require('../models/user'); 
const { ensureAuthenticated } = require('../middleware/enforceAuth');
const router = express.Router();
const jwt = require('jsonwebtoken'); 

// Registration route
router.post('/register', (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    // Register new user
    User.register(new User({ email, firstName, lastName }), password, (err, user) => {
        if (err) {
            console.error('Registration error:', err);  // Improved error logging
            return res.status(500).send(err.message);
        }

        console.log(`Successfully added new user: ${email}`);
        
        // Log the user in after registration
        passport.authenticate('local')(req, res, () => {
            res.status(200).json({ message: 'Registered and logged in', user });
        });
    });
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
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
            // Generate JWT
            const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
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
        res.status(200).json({ message: 'Logout successful' });
  
      });
    });
  });
  

router.get('/user', (req, res) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.isAuthenticated()) {
        return res.status(200).json(req.user);  // Return the user object
    } else {
        return res.status(200).json(null);  // Return null if not authenticated
    }
  });

module.exports = router;
