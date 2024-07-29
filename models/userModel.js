const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "User must have a passwordConfirm"],
    validate: {
      validator(val) {
        return val === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "guide"],
    default: "user",
  },
  resetToken: {
    type: String,
    select: false,
  },
  resetExpires: {
    type: Date,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.modifiedAt = Date.now() - 1000;
    this.resetToken = undefined;
    this.resetExpires = undefined;
  }
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isPasswordModified = function (jwtTimestamp) {
  const timestamp = Math.floor(this.modifiedAt.getTime() / 1000);
  return jwtTimestamp < timestamp;
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
