const mongoose = require("mongoose");
// Take the out of the box functionality from the plm package to extend the user model
const plm = require("passport-local-mongoose");

const UserSchema = {
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
};

// Create a Mongoose schema using the UserSchema object
const mongooseSchema = new mongoose.Schema(UserSchema);

// Apply the passport-local-mongoose plugin to the schema
mongooseSchema.plugin(plm, { usernameField: 'email' }); // use email as the username

// Export the Mongoose model
module.exports = mongoose.model("User", mongooseSchema);
