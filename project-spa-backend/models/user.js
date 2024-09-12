
const mongoose = require("mongoose");
// Take the out of the box functionality from the plm package to extend the user model
const plm = require("passport-local-mongoose");

const UserSchema = {
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
}
const mongooseSchema = new mongoose.Schema(UserSchema);
mongooseSchema.plugin(plm);  // This adds username, password, and salt hashing


module.exports = mongoose.model('User', UserSchema);