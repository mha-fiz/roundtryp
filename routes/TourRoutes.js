const express = require('express')
const tourController = require('../controllers/TourController')
const authController = require('../controllers/AuthController')
const reviewRouter = require('./ReviewRoutes')

const router = express.Router()

// Aggregation Pipeline
router.route('/tour-stats').get(tourController.getTourStats)
router
  .route('/monthly-schedule/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyTourSchedule
  )

//redirecting for nested routes
router.use('/:tourId/reviews', reviewRouter)

// Standard Routes

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  )

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )

module.exports = router
