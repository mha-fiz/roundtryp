const express = require('express')
const tourController = require('../controllers/TourController')

const router = express.Router()

// Aggregation Pipeline
router.route('/tour-stats').get(tourController.getTourStats)
router
  .route('/monthly-schedule/:year')
  .get(tourController.getMonthlyTourSchedule)

// Standard Route
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router
