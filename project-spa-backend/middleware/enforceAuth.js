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

function ensureAuthenticated(req, res, next) {
    console.log('User:', req.user); // Check if user is set
    console.log('Session:', req.session); // Check session data
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

module.exports = { ensureAuthenticated };