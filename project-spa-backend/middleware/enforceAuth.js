/**
 * Middleware function to ensure that a user is authenticated.
 * This is the backend authentication guard used to protect 
 * routes that require user authentication.
 * 
 * It checks if the user is authenticated using the `req.isAuthenticated()` 
 * method provided by Passport.js. If the user is authenticated, 
 * it calls the next middleware in the stack. Otherwise, it responds 
 * with a 401 status and an "Unauthorized" error message.
 * 
 * This guard should be applied to routes that require the user 
 * to be logged in, ensuring secure access to protected resources.
 * 
 * Usage:
 * - Use this middleware in Express routes to restrict 
 *   access to authenticated users only.
 */
const passport = require("passport");
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust the path as needed

async function ensureAuthenticated(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Attach userId to the request object
        
        const user = await User.findById(req.userId); // Optional: Fetch user data if needed
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ error: 'Unauthorized, invalid token' });
    }
}

module.exports = { ensureAuthenticated };
