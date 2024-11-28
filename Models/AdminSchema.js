const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },},
    { timestamps: true }
  );

  // Hash the password before saving it to the database
userSchema.pre("save", async function (next) {
    const admin = this;
    if (admin.isModified("password")) {
      admin.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });

  const Admin = mongoose.model("Admin", adminSchema);
  module.exports = Admin;
