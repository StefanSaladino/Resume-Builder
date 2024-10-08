const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Define education sub-schema
const EducationSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  degreeType: { type: String, required: true },
  degreeName: { type: String, required: true },
  startDate: { type: String, required: true },  // Stored as mm/yyyy string
  endDate: { type: String },  // Optional
  details: { type: String }
});

// Define resume sub-schema for user data
const ResumeSchema = new mongoose.Schema({
  basicInfo: {
    emailAddress: String,
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
  },
  education: [EducationSchema],  // Store multiple education entries
  skills: [{ type: String }],
  volunteer: [{ type: String }],
  experience: [{ type: String }]
});

// Updated UserSchema to ensure resume is initialized
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  resume: { type: ResumeSchema, default: {} }  // Embedded resume schema
});

// Apply the passport-local-mongoose plugin to the schema
UserSchema.plugin(plm, { usernameField: 'email' });

// Export the Mongoose model
module.exports = mongoose.model("User", UserSchema);
