const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tours");

const app = express();
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json());
app.use("/api/v1/tours", tourRouter);

module.exports = app;
