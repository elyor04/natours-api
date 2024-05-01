const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: 30,
      minlength: 5,
    },
    duration: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty can only be easy, medium, or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator(val) {
          return val < this.price;
        },
        message: "Discount should be below the price",
      },
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select: false
    },
  },
  {
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return +(this.duration / 7).toFixed(2);
});

tourSchema.pre(/find|findOne/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

module.exports = mongoose.model("Tour", tourSchema);
