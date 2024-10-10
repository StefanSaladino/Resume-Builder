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
    const userId = req.user.id; // Get the user ID from the authenticated session
    const educationId = req.params.id; // Get the education ID from the route parameter

    // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'resume.education': { _id: educationId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found or education entry not found' });
    }

    // Return the updated education list as part of the response
    res.json({ message: 'Education entry removed successfully', education: user.resume.education });
  } catch (err) {
    console.error('Error deleting education entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Skills
router.get('/skills', async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if resume.education exists
    if (user.resume && user.resume.skills) {
        res.status(200).json(user.resume.skills);
    } else {
        res.status(200).json({ message: 'No skills found (skill issue)', data: null });
    }
} catch (error) {
    console.error('Error retrieving skills:', error);
    res.status(500).json({ message: 'Error retrieving skills' });
}
});

router.post('/skills', async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from JWT
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newSkill = {
      skill: req.body.skill,
      proficiency: req.body.proficiency,
      description: req.body.description,
    };

    user.resume.skills.push(newSkill);
    await user.save();
    res.status(200).json({ message: 'Skills added successfully', data: newSkill });
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try{
  const userId = req.user._id;
  const skillId = req.params.id; 

      // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'resume.skills': { _id: skillId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found or education entry not found' });
    }

    // Return the updated education list as part of the response
    res.json({ message: 'Skill removed successfully', experience: user.resume.skills });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Volunteer
router.get('/volunteer', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.resume.volunteer || []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving volunteer experiences', error });
  }
});

router.post('/volunteer', async (req, res) => {
  console.log('Volunteer Experience Submitted:', req.body);
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newVolunteer = {
      organization: req.body.organization,
      role: req.body.role,
      startDate: req.body.startDate,
      endDate: req.body.endDate || 'Present',
      responsibilities: req.body.responsibilities || []
    };

    user.resume.volunteer.push(newVolunteer);
    await user.save();
    res.status(200).json({ message: 'Volunteer experience added successfully', data: newVolunteer });
  } catch (error) {
    res.status(500).json({ message: 'Error adding volunteer experience', error });
  }
});

router.delete('/volunteer/:id', async (req, res) => {
  try{
  const userId = req.user._id; // Get the logged-in user's ID
  const volunteerId = req.params.id; // Get the experience ID from the request parameters

      // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'resume.volunteer': { _id: volunteerId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found or education entry not found' });
    }

    // Return the updated education list as part of the response
    res.json({ message: 'Volunteer entry removed successfully', experience: user.resume.volunteer });
  } catch (err) {
    console.error('Error deleting volunteer entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Experience
// Get all experiences
router.get('/experience', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.resume.experience || []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving experiences', error });
  }
});

// Add a new experience
router.post('/experience', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newExperience = {
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      startDate: req.body.startDate,
      endDate: req.body.endDate || 'Present',
      responsibilities: req.body.responsibilities || []
    };

    user.resume.experience.push(newExperience);
    await user.save();
    res.status(200).json({ message: 'Experience added successfully', data: newExperience });
  } catch (error) {
    res.status(500).json({ message: 'Error adding experience', error });
  }
});

// Remove an experience
router.delete('/experience/:id', async (req, res) => {
  try{
  const userId = req.user._id; // Get the logged-in user's ID
  const experienceId = req.params.id; // Get the experience ID from the request parameters

      // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { 'resume.experience': { _id: experienceId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found or education entry not found' });
    }

    // Return the updated education list as part of the response
    res.json({ message: 'Experience entry removed successfully', experience: user.resume.experience });
  } catch (err) {
    console.error('Error deleting experience entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.resume|| []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving resume', error });
  }
});

module.exports = router;
