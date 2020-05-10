const Tour = require('../models/TourModel')
const catchAsync = require('../utils/CatchAsync')

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

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  })
})
