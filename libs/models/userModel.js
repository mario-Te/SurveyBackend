const mongoose = require("mongoose");
const Variables = require("../config/constants");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Variables.Roles),
      default: Variables.Roles.user,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
