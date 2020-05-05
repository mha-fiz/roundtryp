const express = require('express')
const reviewController = require('../controllers/ReviewController')
const authController = require('../controllers/AuthController')

const router = express.Router({ mergeParams: true }) //so we could take the params (:tourId) in tourRouter (parent route) to the reviewRouter (child) here

//path: reviewRouter/reviews &&  tourRouter/:tourId/reviews will be redirected here

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview)

module.exports = router
