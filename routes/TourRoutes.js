const express = require('express')
const tourController = require('../controllers/TourController')
const authController = require('../controllers/AuthController')

const router = express.Router()

// Aggregation Pipeline
router.route('/tour-stats').get(tourController.getTourStats)
router
  .route('/monthly-schedule/:year')
  .get(tourController.getMonthlyTourSchedule)

// Standard Route
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('administrator', 'lead-guide'),
    tourController.deleteTour
  )

module.exports = router
