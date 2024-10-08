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
router.get('/education', async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if resume.education exists
    if (user.resume && user.resume.education) {
        res.status(200).json(user.resume.education);
    } else {
        res.status(200).json({ message: 'No education found', data: null });
    }
} catch (error) {
    console.error('Error retrieving education:', error);
    res.status(500).json({ message: 'Error retrieving education' });
}
});

// Add Education - POST
router.post('/education', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check for duplicates before adding
    const existingEducation = user.resume.education.find(ed => 
      ed.schoolName === req.body.schoolName &&
      ed.degreeType === req.body.degreeType &&
      ed.degreeName === req.body.degreeName &&
      ed.startDate === req.body.startDate &&
      ed.endDate === (req.body.endDate || 'Present')
    );

    if (existingEducation) {
      return res.status(400).json({ message: 'Education entry already exists' });
    }

    // Add new education entry to the education array
    const newEducation = {
      schoolName: req.body.schoolName,
      degreeType: req.body.degreeType,
      degreeName: req.body.degreeName,
      startDate: req.body.startDate,
      endDate: req.body.endDate || 'Present',
      details: req.body.details
    };

    user.resume.education.push(newEducation);
    await user.save();
    res.status(200).json({ message: 'Education added successfully', data: newEducation });
  } catch (error) {
    console.error('Error saving education:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Remove Education instance
router.delete('/education/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming Passport sets req.user
    const educationId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { education: { _id: educationId } } }, // Remove the education with matching _id
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User or education entry not found');
    }

    res.send(user); // Send updated user object or success message
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
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
