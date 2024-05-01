const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
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
  __v: { type: Number, select: false },
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isPasswordModified = function (jwtTimestamp) {
  const timestamp = Math.floor(this.modifiedAt.getTime() / 1000);
  return timestamp > jwtTimestamp;
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.modifiedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
