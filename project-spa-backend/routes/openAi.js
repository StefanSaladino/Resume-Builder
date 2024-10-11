const express = require('express');
const router = express.Router();
const http = require('https');
const { ensureAuthenticated } = require('../middleware/enforceAuth');
const { verifyToken } = require('../middleware/tokenVerifier');

// Middleware to ensure the user is authenticated
router.use(ensureAuthenticated);

// Define routes for different parts of the resume
// Apply the token verification middleware to all /resume routes
router.use(verifyToken);


router.get('/generate-resume', async (req, res) => {
    try {
        const user = await User.findById(req.userId); // Use req.userId from the token
        if (!user) return res.status(404).json({ message: 'User not found' });
  
        // Check if resume.basicInfo exists
        if (user.resume) {
            res.status(200).json(user.resume);
        } else {
            res.status(200).json({ message: 'No resume found', data: null });
        }
    } catch (error) {
        console.error('Error retrieving basic info:', error);
        res.status(500).json({ message: 'Error retrieving basic info' });
    }
  });

router.post('/generate-resume', (req, res) => {
    const userInfo = req.body.userInfo;  // Assume userInfo is passed in the request body

    // Create the prompt based on user's information
    const prompt = `
    Create a detailed and professionally appealing resume for the following individual. 
    The resume should emphasize their strengths and achievements, and where possible, infer additional details 
    from the skills, experience, and other information provided. Make the user sound as appealing as possible 
    for a potential employer:
    
    Name: ${userInfo.firstName} ${userInfo.lastName}
    Email: ${userInfo.email}
    
    Basic Information:
    Phone Number: ${userInfo.phone || 'N/A'} 
    Location: ${userInfo.location || 'N/A'} 
    
    Skills:
    ${userInfo.skills.length > 0 ? userInfo.skills.join(', ') : 'No skills provided'}
    
    Experience:
    ${userInfo.experience.length > 0 ? userInfo.experience.map(exp => 
      `Role: ${exp.role} at ${exp.company} (${exp.start} - ${exp.end})
       Responsibilities: ${exp.responsibilities || 'Not provided'}
       Achievements: Highlight any key contributions or successes in this role, inferred from the responsibilities and skills provided.
      `).join('\n') : 'No experience provided'}
    
    Education:
    ${userInfo.education.length > 0 ? userInfo.education.map(edu => 
      `Degree: ${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (${edu.startYear} - ${edu.endYear})
      `).join('\n') : 'No education provided'}
    
    Volunteer Work:
    ${userInfo.volunteer.length > 0 ? userInfo.volunteer.map(vol => 
      `Organization: ${vol.organization} (${vol.start} - ${vol.end})
       Role: ${vol.role}
       Responsibilities: ${vol.responsibilities || 'Not provided'}
      `).join('\n') : 'No volunteer work provided'}
    
    Please infer additional relevant details about the user's strengths, skills, and experience that can 
    help enhance the resume. Tailor the language to sound professional, persuasive, and focused on making 
    the user an attractive candidate for potential employers. 
    Use strong action verbs, emphasize their value, and demonstrate results or impacts where applicable.
    `;
    
    // Log the prompt to test it before making API call
    console.log('Generated Resume Prompt:', prompt);

    // Commented out API call for testing purposes
    
    const options = {
        method: 'POST',
        hostname: 'chatgpt-42.p.rapidapi.com',
        port: null,
        path: '/conversationgpt4-2',
        headers: {
            'x-rapidapi-key': '9bbd770d55mshbcbbe367ee48fa0p1a1c49jsn490561015f76',
            'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };

    const reqApi = http.request(options, function (resApi) {
        const chunks = [];

        resApi.on('data', function (chunk) {
            chunks.push(chunk);
        });

        resApi.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            res.status(200).json({ success: true, data: body.toString() });
        });
    });

    reqApi.write(JSON.stringify({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system_prompt: '',
      temperature: 0.9,
      top_k: 5,
      top_p: 0.9,
      max_tokens: 256,
      web_access: false
    }));
    reqApi.end();
    

    // Respond with a message indicating the prompt was logged
    res.status(200).json({ message: 'Prompt logged for testing', prompt });
});

module.exports = router;
