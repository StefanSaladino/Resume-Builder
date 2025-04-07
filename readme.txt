Resume Builder
A full-stack resume-building web application that allows users to register, log in, manage their resume sections (basic info, skills, education, experience, and volunteer work), and export a professional-looking Word document. Built with the MEAN stack (MongoDB, Express, Angular, Node.js) and integrated with Python for document generation.

Live Demo
Frontend: https://resume-builder-3aba3.web.app
Backend: https://resume-builder-backend-ahjg.onrender.com

Tech Stack
Frontend: Angular, TypeScript, SCSS

Backend: Node.js, Express.js, Passport.js

Database: MongoDB with Mongoose

Auth: Passport Local Strategy, Sessions (MongoStore), JWT, Email Verification via SendGrid

Deployment: Firebase Hosting (Frontend), Render (Backend)

Extras: Python (Flask) API for Word doc generation

Features
✅ User registration with email verification

✅ Secure login with JWT + session authentication

✅ Password reset via email

✅ Resume sections:

Basic Info

Skills

Education

Experience

Volunteer Work

✅ Word document export (via integrated Python API)

✅ Responsive and mobile-friendly UI

🔧 Installation & Setup
Prerequisites
Node.js & npm

Angular CLI (npm install -g @angular/cli)

MongoDB (Atlas or local)

Python (for the Flask service, optional)