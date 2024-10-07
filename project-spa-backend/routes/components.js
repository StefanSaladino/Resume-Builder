const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/enforceAuth');
const { verifyToken } = require('../middleware/tokenVerifier');
const passport = require('passport');
const User = require('../models/user'); 

// Middleware to ensure the user is authenticated
router.use(ensureAuthenticated);

// Define routes for different parts of the resume
// Apply the token verification middleware to all /resume routes
router.use(verifyToken);

// Basic Info
router.post('/basic-info', async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from JWT
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure resume is initialized
    if (!user.resume) {
      user.resume = {}; // Initialize if it doesn't exist
    }
    if (!user.resume.basicInfo) {
      user.resume.basicInfo = {}; // Initialize basicInfo if it doesn't exist
    }

    // Update the user's basic info in the resume
    user.resume.basicInfo = {
      emailAddress: req.body.emailAddress,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
    };

    await user.save(); // Save changes to the database
    res.status(200).json({ message: 'Basic Info saved successfully' });
  } catch (error) {
    console.error('Error saving basic info:', error);
    res.status(500).json({ message: 'Error saving basic info' });
  }
});


// Get route to retrieve the user's basic info
// Get route to retrieve the user's basic info
router.get('/basic-info', async (req, res) => {
  try {
      const user = await User.findById(req.userId); // Use req.userId from the token
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check if resume.basicInfo exists
      if (user.resume && user.resume.basicInfo) {
          res.status(200).json(user.resume.basicInfo);
      } else {
          res.status(200).json({ message: 'No basic info found', data: null });
      }
  } catch (error) {
      console.error('Error retrieving basic info:', error);
      res.status(500).json({ message: 'Error retrieving basic info' });
  }
});

  

// Education
router.get('/education', verifyToken, (req, res) => {
  res.render('education', { title: 'Education' });
});

// Education route - POST (to save education data)
router.post('/education', verifyToken, async (req, res) => {
  try {
    // Get the authenticated user by ID from the token
    const userId = req.user.id;

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Education data from the form submission
    const { schoolName, degreeType, degreeName, startDate, endDate, details } = req.body;

    // Create the new education entry
    const newEducation = {
      schoolName,
      degreeType,
      degreeName,
      startDate,
      endDate: endDate || 'Present', // If no end date, assume "Present"
      details
    };

    // Add the new education to the user's education array
    user.education.push(newEducation);

    // Save the user with the new education data
    await user.save();

    // Respond with success
    res.status(200).json({ message: 'Education added successfully', data: newEducation });
  } catch (error) {
    console.error('Error saving education:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Skills
router.get('/skills', (req, res) => {
  res.render('skills', { title: 'Skills' });
});

router.post('/skills', (req, res) => {
  console.log('Skills Submitted:', req.body);
  res.status(200).json({ message: 'Skills Received', data: req.body });
});

// Volunteer
router.get('/volunteer', (req, res) => {
  res.render('volunteer', { title: 'Volunteer Experience' });
});

router.post('/volunteer', (req, res) => {
  console.log('Volunteer Experience Submitted:', req.body);
  res.status(200).json({ message: 'Volunteer Experience Received', data: req.body });
});

// Experience
router.get('/experience', (req, res) => {
  res.render('experience', { title: 'Experience' });
});

router.post('/experience', (req, res) => {
  console.log('Experience Submitted:', req.body);
  res.status(200).json({ message: 'Experience Received', data: req.body });
});

module.exports = router;
