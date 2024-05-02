const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUsers = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(User.find(), req.query);
  features.filter().limitFields().paginate().sort();
  const users = await features.queryCol;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(User.findById(req.params.id), req.query);
  features.limitFields();

  const user = await features.queryCol;
  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.createUser = catchAsync(async function (req, res, next) {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  for (field in req.body) user[field] = req.body[field];
  await user.save();

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: null,
  });
});
