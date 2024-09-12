const express = require('express');
const passport = require('passport');
const User = require('../models/user'); // User model
const router = express.Router();

// Register route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    User.register(new User({ username: username }), password, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error registering user' });
        }
        passport.authenticate('local')(req, res, () => {
            res.status(200).json({ message: 'Registration successful' });
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
