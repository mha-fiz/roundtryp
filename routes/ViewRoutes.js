const express = require('express')
const viewController = require('../controllers/ViewController')
const authController = require('../controllers/AuthController')
const bookingController = require('../controllers/BookingController')

const router = express.Router()

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
)
router.get('/signup', viewController.signup)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.login)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/my-tours', authController.protect, viewController.getMyTours)

module.exports = router
