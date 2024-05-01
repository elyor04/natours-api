const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(Tour.find(), req.query);
  features.filter().limitFields().paginate().sort();
  const tours = await features.queryCol;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const features = new APIFeatures(Tour.findById(req.params.id), req.query);
  features.limitFields();

  const tour = await features.queryCol;
  if (!tour) return next(new AppError("No tour found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.createTour = catchAsync(async function (req, res, next) {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError("No tour found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.deleteTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError("No tour found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { plan },
  });
});
