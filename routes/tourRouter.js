const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/tour-stats")
  .get(authController.protect, tourController.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(authController.protect, tourController.getMonthlyPlan);

router
  .route("/top-5-cheap")
  .get(
    authController.protect,
    tourController.aliasTopTours,
    tourController.getAllTours
  );

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.allowTo("admin"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(authController.protect, tourController.getTour)
  .patch(
    authController.protect,
    authController.allowTo("admin"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.allowTo("admin"),
    tourController.deleteTour
  );

module.exports = router;
