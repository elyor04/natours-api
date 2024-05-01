const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./utils/errorHandler");
const AppError = require("./utils/appError");

const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});
app.use(errorHandler);

module.exports = app;
