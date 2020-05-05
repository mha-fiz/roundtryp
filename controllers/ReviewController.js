const Review = require('../models/ReviewModel')
const handlerBuilder = require('./HandlerBuilder')

exports.getAllReviews = handlerBuilder.getAll(Review)

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes

  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id

  next()
}

exports.getReview = handlerBuilder.getOne(Review)
exports.createReview = handlerBuilder.createOne(Review)
exports.updateReview = handlerBuilder.updateOne(Review)
exports.deleteReview = handlerBuilder.deleteOne(Review)
