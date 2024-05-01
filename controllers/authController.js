const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

function signToken(id) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
  });

  res.status(201).json({
    status: "success",
    token: await signToken(newUser._id),
    data: { user: newUser },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password)))
    return next(new AppError("Invalid email or password", 401));

  res.status(200).json({
    status: "success",
    token: await signToken(user._id),
  });
});

exports.protect = catchAsync(async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")?.[1];
  if (!token) return next(new AppError("You are not logged in!", 401));

  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.id).select("+modifiedAt");

  if (!user) return next(new AppError("User no longer exists!", 401));
  if (user.isPasswordModified(decoded.iat))
    return next(new AppError("Password Modified!", 401));

  req.user = user;
  next();
});
