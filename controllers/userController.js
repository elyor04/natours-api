const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

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

exports.getUser = async function (req, res, next) {
  res.status(500).json({
    status: "error",
    message: "This route is not complete",
  });
};

exports.createUser = async function (req, res, next) {
  res.status(500).json({
    status: "error",
    message: "This route is not complete",
  });
};

exports.updateUser = async function (req, res, next) {
  res.status(500).json({
    status: "error",
    message: "This route is not complete",
  });
};

exports.deleteUser = async function (req, res, next) {
  res.status(500).json({
    status: "error",
    message: "This route is not complete",
  });
};
