const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/enforceAuth");
const { verifyToken } = require("../middleware/tokenVerifier");
const passport = require("passport");
const User = require("../models/user");
const dotenv = require("dotenv");

// Middleware to ensure the user is authenticated
router.use(ensureAuthenticated);

// Define routes for different parts of the resume
// Apply the token verification middleware to all /resume routes
router.use(verifyToken);

// Basic Info
router.post("/basic-info", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from JWT
    if (!user) return res.status(404).json({ message: "User not found" });

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
      desiredField: req.body.desiredField
    };

    await user.save(); // Save changes to the database
    res.status(200).json({ message: "Basic Info saved successfully" });
  } catch (error) {
    console.error("Error saving basic info:", error);
    res.status(500).json({ message: "Error saving basic info" });
  }
});

// Get route to retrieve the user's basic info
router.get("/basic-info", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if resume.basicInfo exists
    if (user.resume && user.resume.basicInfo) {
      res.status(200).json(user.resume.basicInfo);
    } else {
      res.status(200).json({ message: "No basic info found", data: null });
    }
  } catch (error) {
    console.error("Error retrieving basic info:", error);
    res.status(500).json({ message: "Error retrieving basic info" });
  }
});

// Education
router.get("/education", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if resume.education exists
    if (user.resume && user.resume.education) {
      res.status(200).json(user.resume.education);
    } else {
      res.status(200).json({ message: "No education found", data: null });
    }
  } catch (error) {
    console.error("Error retrieving education:", error);
    res.status(500).json({ message: "Error retrieving education" });
  }
});

// Add Education - POST
router.post("/education", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check for duplicates before adding
    const existingEducation = user.resume.education.find(
      (ed) =>
        ed.schoolName === req.body.schoolName &&
        ed.degreeType === req.body.degreeType &&
        ed.degreeName === req.body.degreeName &&
        ed.startDate === req.body.startDate &&
        ed.endDate === (req.body.endDate || "Present")
    );

    if (existingEducation) {
      return res
        .status(400)
        .json({ message: "Education entry already exists" });
    }

    // Add new education entry to the education array
    const newEducation = {
      schoolName: req.body.schoolName,
      degreeType: req.body.degreeType,
      degreeName: req.body.degreeName,
      startDate: req.body.startDate,
      endDate: req.body.endDate || "Present",
      details: req.body.details,
    };

    user.resume.education.push(newEducation);
    await user.save();
    res
      .status(200)
      .json({ message: "Education added successfully", data: newEducation });
  } catch (error) {
    console.error("Error saving education:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove Education instance
router.delete("/education/:id", async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated session
    const educationId = req.params.id; // Get the education ID from the route parameter

    // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "resume.education": { _id: educationId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or education entry not found" });
    }

    // Return the updated education list as part of the response
    res.json({
      message: "Education entry removed successfully",
      education: user.resume.education,
    });
  } catch (err) {
    console.error("Error deleting education entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/education/:_id", async (req, res, next) => {
  try {
    // Find the user by the authenticated user's ID
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the education ID from the route parameters
    const educationId = req.params._id;

    // Find the specific education entry by its _id in the user's resume
    const educationEntry = user.resume.education.id(educationId);
    if (!educationEntry) {
      return res.status(404).json({ message: "Education entry not found" });
    }

    // Update the education entry fields
    educationEntry.schoolName = req.body.schoolName || educationEntry.schoolName;
    educationEntry.degreeType = req.body.degreeType || educationEntry.degreeType;
    educationEntry.degreeName = req.body.degreeName || educationEntry.degreeName;
    educationEntry.startDate = req.body.startDate || educationEntry.startDate;
    educationEntry.endDate = req.body.endDate || educationEntry.endDate;
    educationEntry.details = req.body.details || educationEntry.details;

    // Save the updated user document
    await user.save();

    // Respond with the updated education entry
    res.status(200).json(educationEntry);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});



// Skills
router.get("/skills", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if resume.education exists
    if (user.resume && user.resume.skills) {
      res.status(200).json(user.resume.skills);
    } else {
      res
        .status(200)
        .json({ message: "No skills found (skill issue)", data: null });
    }
  } catch (error) {
    console.error("Error retrieving skills:", error);
    res.status(500).json({ message: "Error retrieving skills" });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from JWT
    if (!user) return res.status(404).json({ message: "User not found" });

    const newSkill = {
      skill: req.body.skill,
      proficiency: req.body.proficiency,
      description: req.body.description,
    };

    user.resume.skills.push(newSkill);
    await user.save();
    res
      .status(200)
      .json({ message: "Skills added successfully", data: newSkill });
  } catch (error) {
    res.status(500).json({ message: "Error adding skill", error });
  }
});

router.delete("/skills/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const skillId = req.params.id;

    // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "resume.skills": { _id: skillId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or education entry not found" });
    }

    // Return the updated education list as part of the response
    res.json({
      message: "Skill removed successfully",
      experience: user.resume.skills,
    });
  } catch (err) {
    console.error("Error deleting skill:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Volunteer
router.get("/volunteer", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.resume.volunteer || []);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving volunteer experiences", error });
  }
});

router.post("/volunteer", async (req, res) => {
  console.log("Volunteer Experience Submitted:", req.body);
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newVolunteer = {
      organization: req.body.organization,
      role: req.body.role,
      startDate: req.body.startDate,
      endDate: req.body.endDate || "Present",
      responsibilities: req.body.responsibilities || [],
      impact: req.body.impact || null,
    };

    user.resume.volunteer.push(newVolunteer);
    await user.save();
    res.status(200).json({
      message: "Volunteer experience added successfully",
      data: newVolunteer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding volunteer experience", error });
  }
});

router.delete("/volunteer/:id", async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID
    const volunteerId = req.params.id; // Get the experience ID from the request parameters

    // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "resume.volunteer": { _id: volunteerId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or education entry not found" });
    }

    // Return the updated education list as part of the response
    res.json({
      message: "Volunteer entry removed successfully",
      experience: user.resume.volunteer,
    });
  } catch (err) {
    console.error("Error deleting volunteer entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/volunteer/:_id", async (req, res, next) => {
  try {
    // Find the user by their authenticated user ID
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the experience ID from the route parameters
    const volId = req.params._id;

    // Find the specific experience entry by its _id in the user's resume
    const volEntry = user.resume.volunteer.id(volId);
    if (!volEntry) {
      return res.status(404).json({ message: "Volunteer entry not found" });
    }

    // Update the experience entry fields
    volEntry.organization = req.body.organization || volEntry.organization;
    volEntry.role = req.body.role || volEntry.role;
    volEntry.startDate = req.body.startDate || volEntry.startDate;
    volEntry.endDate = req.body.endDate || volEntry.endDate;
    volEntry.responsibilities = req.body.responsibilities || volEntry.responsibilities;
    volEntry.impact = req.body.impact || volEntry.impact;

    // Save the updated user document
    await user.save();

    // Respond with the updated experience entry
    res.status(200).json(volEntry);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

// Experience
// Get all experiences
router.get("/experience", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.resume.experience || []);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving experiences", error });
  }
});

// Add a new experience
router.post("/experience", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newExperience = {
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      startDate: req.body.startDate,
      endDate: req.body.endDate || "Present",
      responsibilities: req.body.responsibilities || [],
      achievements: req.body.achievements || null,
    };

    user.resume.experience.push(newExperience);
    await user.save();
    res
      .status(200)
      .json({ message: "Experience added successfully", data: newExperience });
  } catch (error) {
    res.status(500).json({ message: "Error adding experience", error });
  }
});

// Remove an experience
router.delete("/experience/:id", async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID
    const experienceId = req.params.id; // Get the experience ID from the request parameters

    // Find the user and remove the specific education entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "resume.experience": { _id: experienceId } } }, // Use the correct path to remove the education entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or education entry not found" });
    }

    // Return the updated education list as part of the response
    res.json({
      message: "Experience entry removed successfully",
      experience: user.resume.experience,
    });
  } catch (err) {
    console.error("Error deleting experience entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/experience/:_id", async (req, res, next) => {
  try {
    // Find the user by their authenticated user ID
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the experience ID from the route parameters
    const experienceId = req.params._id;

    // Find the specific experience entry by its _id in the user's resume
    const experienceEntry = user.resume.experience.id(experienceId);
    if (!experienceEntry) {
      return res.status(404).json({ message: "Experience entry not found" });
    }

    // Update the experience entry fields
    experienceEntry.jobTitle = req.body.jobTitle || experienceEntry.jobTitle;
    experienceEntry.company = req.body.company || experienceEntry.company;
    experienceEntry.startDate = req.body.startDate || experienceEntry.startDate;
    experienceEntry.endDate = req.body.endDate || experienceEntry.endDate;
    experienceEntry.responsibilities = req.body.responsibilities || experienceEntry.responsibilities;
    experienceEntry.achievements = req.body.achievements || experienceEntry.achievements;

    // Save the updated user document
    await user.save();

    // Respond with the updated experience entry
    res.status(200).json(experienceEntry);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});


// Get all miscellaneous entries
router.get("/miscellaneous", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.resume.miscellaneous || []);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving miscellaneous entries", error });
  }
});

// Add a new miscellaneous entry
router.post("/miscellaneous", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newMiscellaneous = {
      type: req.body.type, // E.g., Certificate, Language, etc.
      title: req.body.title,
      description: req.body.description || "", // Optional description field
    };

    user.resume.miscellaneous.push(newMiscellaneous);
    await user.save();

    res.status(200).json({
      message: "Miscellaneous entry added successfully",
      data: newMiscellaneous,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding miscellaneous entry", error });
  }
});

// Update a miscellaneous entry
router.put("/miscellaneous/:id", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const miscellaneousEntry = user.resume.miscellaneous.id(req.params.id);
    if (!miscellaneousEntry)
      return res.status(404).json({ message: "Miscellaneous entry not found" });

    // Update the fields
    miscellaneousEntry.type = req.body.type || miscellaneousEntry.type;
    miscellaneousEntry.title = req.body.title || miscellaneousEntry.title;
    miscellaneousEntry.description =
      req.body.description || miscellaneousEntry.description;

    await user.save();

    res.status(200).json({
      message: "Miscellaneous entry updated successfully",
      data: miscellaneousEntry,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating miscellaneous entry", error });
  }
});

// Remove a miscellaneous entry
router.delete("/miscellaneous/:id", async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID
    const miscellaneousId = req.params.id; // Get the miscellaneous entry ID from the request parameters

    // Find the user and remove the specific miscellaneous entry from the resume
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { "resume.miscellaneous": { _id: miscellaneousId } } }, // Use the correct path to remove the miscellaneous entry
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User or miscellaneous entry not found" });
    }

    // Return the updated miscellaneous list as part of the response
    res.json({
      message: "Miscellaneous entry removed successfully",
      miscellaneous: user.resume.miscellaneous,
    });
  } catch (error) {
    console.error("Error deleting miscellaneous entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.resume || []);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving resume", error });
  }
});

// Generate resume route
router.get("/generate-resume", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Use req.userId from the token
    console.log("User ID in POST route:", req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if resume exists
    if (user.resume) {
      return res.status(200).json(user.resume);
    } else {
      return res.status(200).json({ message: "No resume found", data: null });
    }
  } catch (error) {
    console.error("Error retrieving resume:", error);
    return res.status(500).json({ message: "Error retrieving resume" });
  }
});

// POST route to generate resume
const http = require("https");

router.post("/generate-resume", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Ensure req.userId is set correctly by your verifyToken middleware
    if (!user) return res.status(404).send("<h1>User not found</h1>");

    // Create the prompt based on the user's information
    const prompt = `
    Please create a polished, professional resume based on the following information, ensuring it is formatted for 
    easy readability and presentation. Pretend you are creating a resume written by a human. In your response, I do not require any info other than the resume itself.
    You must not add any comments about what you've done or the prompt. The entirety of the response must be strictly
    limited to the resume content and should not include any summaries or closing statements. Assume that your response 
    will be taken and submitted directly to an employer. The current user is looking for a job in ${user.resume.basicInfo.desiredField},
    so you may tailor the resume to be as desirable as possible to employers in that field.
    
    The following formatting template should not actually be included in the resume, rather it is a guideline for 
    how to respond.
    
    **Formatting Template:**  
    - Use a clean and professional font (e.g., Arial, Calibri, or Times New Roman) in size 10-12 for body text.
    - Ensure section headings are bold and slightly larger (e.g., size 14-16).
    - Maintain consistent spacing between sections (at least one blank line).
    - Use bullet points for lists (skills, responsibilities, achievements).
    - Align text to the left for a traditional layout, with the name at the top center.
    - Consider adding a line under the name for separation from contact information.
    
    Please ensure that this response is a complete and visually appealing resume layout, 
    using appropriate headings and bullet points for clarity. This resume should be ready for submission.
    Take the information the user has provided and expand on it to make the user's resume more impressive. 
    Make the resume sound more erudite and professional.
    You may infer accomplishments from the provided information. Also create a brief profile based on the user's provided data.
    Please ensure that all section headings are bold and centered, and separate each section with an underline. 
    Remove any extraneous characters (like asterisks) around headings.
    
    
    ACTUAL RESUME CONTENT STARTS HERE: 
    
                    ${user.resume.basicInfo.firstName} ${user.resume.basicInfo.lastName} 
                            ${user.resume.basicInfo.address || "N/A"}  
                ${user.resume.basicInfo.phone || "N/A"} | ${user.resume.basicInfo.emailAddress}
    
    
    (NOTE: PROFILE SUMMARY GOES HERE. WRITE THIS IN FIRST PERSON. DO NOT ACTUALLY WRITE WHAT IS CONTAINED IN BRACKETS.)
    PROFILE SUMMARY:
    
    Skills:  
    ${
      user.resume.skills.length > 0
        ? user.resume.skills.join(", ")
        : "No skills provided"
    }  
    
      Professional Experience:
  ${
    user.resume.experience.length > 0
      ? user.resume.experience
          .map(
            (exp) => `
     Role: ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${
              exp.endDate || "Present"
            })  
      Responsibilities: ${
        exp.responsibilities.join(", ") || "Not provided"
      }  
      ${exp.achievements ? `Achievements: ${exp.achievements}` : ""}  
  `
          )
          .join("\n")
      : "No experience provided"
  }
  
  (NOTE: Please make user's accomplishments sound as grandiose and impressive as possible)
    
    Education:  
    ${
      user.resume.education.length > 0
        ? user.resume.education
            .map(
              (ed) => `
      - Degree: ${ed.degreeName} from ${ed.schoolName} (${ed.startDate} - ${
                ed.endDate || "Present"
              })  
        Details: ${ed.details || "Not provided"}  
    `
            )
            .join("\n")
        : "No education provided"
    }  
    
    Volunteer Experience:  
    ${
      user.resume.volunteer.length > 0
        ? user.resume.volunteer
            .map(
              (vol) => `
      - Organization: ${vol.organization}  
        Role: ${vol.role} (${vol.startDate} - ${vol.endDate || "Present"})  
        Responsibilities: ${vol.responsibilities.join(", ") || "Not provided"}
        Impact: ${vol.impact}  
    `
            )
            .join("\n")
        : "No volunteer experience provided"
    }
    
    (NOTE: Please take the user's written impact and alter it to sound more impressive and emphasize the
    benefits to the community. If no impact is provided, infer the impact from the responsibilities the
    user provided.)
    
    ${
      user.resume.miscellaneous.filter((misc) => misc.type === "language")
        .length > 0
        ? `
    Languages  
    ${user.resume.miscellaneous
      .filter((misc) => misc.type === "language")
      .map(
        (misc) => `
      - ${misc.title}: ${misc.description}
    `
      )
      .join("\n")}
    `
        : ""
    }
    
    ${
      user.resume.miscellaneous.filter((misc) => misc.type === "certificate")
        .length > 0
        ? `
    Certificates  
    ${user.resume.miscellaneous
      .filter((misc) => misc.type === "certificate")
      .map(
        (misc) => `
      - ${misc.title}: ${misc.description}
    `
      )
      .join("\n")}
    `
        : ""
    }
    
    ${
      user.resume.miscellaneous.filter(
        (misc) => misc.type === "extracurricular"
      ).length > 0
        ? `
    Other Achievements
    ${user.resume.miscellaneous
      .filter((misc) => misc.type === "extracurricular")
      .map(
        (misc) => `
      - ${misc.title}: ${misc.description}
    `
      )
      .join("\n")}
    `
        : ""
    }
    
    RESUME SHOULD END HERE. NO ADDITIONAL CONTENT AT THE END.
    
    `;

    console.log("Generated Resume Prompt:", prompt);

    const options = {
      method: "POST",
      hostname: "infinite-gpt.p.rapidapi.com",
      port: null,
      path: "/infinite-gpt",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "infinite-gpt.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    };

    const reqApi = http.request(options, (resApi) => {
      const chunks = [];

      resApi.on("data", (chunk) => {
        chunks.push(chunk);
      });

      resApi.on("end", async () => {
        const body = Buffer.concat(chunks).toString();
        if (resApi.statusCode !== 200) {
          return res.status(500).json({ message: "Error generating resume" });
        }

        const responseBody = JSON.parse(body); // Assuming the body is JSON
        const msg = responseBody.msg || "No message returned"; // Extract msg field

        // Save the generated resume to the user record
        user.resume.generatedResume = msg; // Use msg instead of generatedResume
        await user.save();

        res.json({ msg });
      });
    });

    reqApi.on("error", (error) => {
      console.error("Error with API request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });

    reqApi.write(
      JSON.stringify({
        query: prompt,
        sysMsg: "You are a friendly Chatbot that creates professional resumes.",
      })
    );

    reqApi.end();
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Error generating resume" });
  }
});

module.exports = router;
