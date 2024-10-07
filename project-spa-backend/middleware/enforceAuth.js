function ensureAuthenticated(req, res, next) {
    console.log('User:', req.user); // Check if user is set
    console.log('Session:', req.session); // Check session data
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

module.exports = { ensureAuthenticated };