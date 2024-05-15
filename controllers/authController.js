const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/sendEmail");
const filterObj = require("../utils/filterObj");

const signToken = (id) => {
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
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(
    filterObj(req.body, "name", "email", "password", "passwordConfirm", "photo")
  );

  res.status(201).json({
    status: "success",
    token: await signToken(newUser._id),
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
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

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")?.[1];
  if (!token) return next(new AppError("You are not logged in!", 401));

  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.id).select("+modifiedAt");

  if (!user) return next(new AppError("User does not exist!", 401));
  if (user.isPasswordModified(decoded.iat))
    return next(new AppError("Password changed!", 401));

  req.user = user;
  next();
});

exports.allowTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    next(new AppError("You are not allowed to do this operation!", 403));
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please provide an email.", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No user found with this email.", 404));

  const resetToken = user.generateResetToken();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password?
Submit a PATCH request with your new password and passwordConfirm to ${resetURL}
If you didn't forget your password, please ignore this email`;

  await sendEmail(
    email,
    "Your password reset token (valid for 10 min)",
    message
  );
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Reset tokent sent to email.",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetToken,
    resetExpires: { $gte: Date.now() },
  });
  if (!user) return next(new AppError("Invalid token!", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(200).json({
    status: "success",
    token: await signToken(user._id),
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.checkPassword(req.body.passwordCurrent)))
    return next(new AppError("Wrong current password!", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(200).json({
    status: "success",
    token: await signToken(user._id),
  });
});
