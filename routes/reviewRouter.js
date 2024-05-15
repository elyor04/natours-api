const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.allowTo("user"),
    reviewController.createReview
  );

router
  .route("/:id")
  .get(authController.protect, reviewController.getReview);

module.exports = router;
