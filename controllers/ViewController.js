const Tour = require('../models/TourModel')
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')

exports.getOverview = catchAsync(async (req, res) => {
  //  a. Get data from API
  const tours = await Tour.find()

  //  b. Serve data with template
  //  c. Send it as response
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })

  if (!tour) {
    next(new AppError('There is no tour with that name', 404))
  }

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  })
})

exports.signup = catchAsync(async (req,res) => {
  res.status(200).render('signup', {title: 'Sign up'})
})

exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', { title: 'Login' })
})

exports.getAccount = (req,res) => {
  res.status(200).render('account', {title: 'Your account'})
}