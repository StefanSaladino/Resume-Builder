const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Define skills sub-schema
const SkillsSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  proficiency: { type: String, required: true },
  description: { type: String },
});

// Define work experience sub-schema
const ExperienceSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: String, required: true }, // Stored as mm/yyyy string
  endDate: { type: String }, // Optional, defaults to 'Present'
  responsibilities: [{ type: String, required: true }], // Array of responsibilities
  achievements: [{ type: String }],
});

const VolunteerSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  responsibilities: [{ type: String, required: true }],
  impact: { type: String },
});

// Define education sub-schema
const EducationSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  degreeType: { type: String, required: true },
  degreeName: { type: String, required: true },
  startDate: { type: String, required: true }, // Stored as mm/yyyy string
  endDate: { type: String }, // Optional
  details: { type: String },
});

// Define miscellaneous sub-schema with enum type
const MiscellaneousSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ["extracurricular", "language", "certificate", "project"], // Enum for dropdown
    required: true,
  },
});

// Define resume sub-schema for user data
const ResumeSchema = new mongoose.Schema({
  basicInfo: {
    emailAddress: String,
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    desiredField: String,
  },
  education: [EducationSchema],
  skills: [SkillsSchema],
  volunteer: [VolunteerSchema],
  experience: [ExperienceSchema],
  miscellaneous: [MiscellaneousSchema],
  generatedResume: { type: String },
});

// Updated UserSchema to ensure resume is initialized
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  resume: { type: ResumeSchema, default: {} },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  apiCallsToday: {
    type: Number,
    default: 0
  }
});

// Apply the passport-local-mongoose plugin to the schema
UserSchema.plugin(plm, { usernameField: "email" });

// Export the Mongoose model
module.exports = mongoose.model("User", UserSchema);
