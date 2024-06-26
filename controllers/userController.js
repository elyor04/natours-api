const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const filterObj = require("../utils/filterObj");
const bcrypt = require("bcryptjs");

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    filterObj(req.body, "name", "email", "photo"),
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query);
  features.filter().limitFields().paginate().sort();
  const users = await features.queryCol;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.findById(req.params.id), req.query);
  features.limitFields();

  const user = await features.queryCol;
  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const data = filterObj(
    req.body,
    "name",
    "email",
    "password",
    "passwordConfirm",
    "photo",
    "role",
    "active"
  );

  if (data.password !== data.passwordConfirm)
    return next(new AppError("Passwords are not the same!", 400));

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
    data.passwordConfirm = undefined;
    data.modifiedAt = Date.now() - 1000;
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { user: Object.assign(user, data) },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: null,
  });
});
