const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Define resume sub-schema for user data
const ResumeSchema = new mongoose.Schema({
  basicInfo: {
    emailAddress: String,
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
  },
  education: [ /* Define education fields */ ],
  skills: [ /* Define skills fields */ ],
  volunteer: [ /* Define volunteer fields */ ],
  experience: [ /* Define experience fields */ ],
});

// Updated UserSchema to ensure resume is initialized
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resume: {
    type: ResumeSchema,
    default: {}  // Initialize as an empty object
  }, // Embedded resume schema
});

// Apply the passport-local-mongoose plugin to the schema
UserSchema.plugin(plm, { usernameField: 'email' }); // use email as the username

// Export the Mongoose model
module.exports = mongoose.model("User", UserSchema);
