const express = require('express');
const passport = require('passport');
const User = require('../models/user'); // User model
const router = express.Router();

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


// Login route
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: true
}), (req, res) => {
    res.status(200).json({ message: 'Login successful', user: req.user });
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
