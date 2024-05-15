const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError("No review found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { review },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create({ ...req.body, user: req.user._id });

  res.status(201).json({
    status: "success",
    data: { review },
  });
});
