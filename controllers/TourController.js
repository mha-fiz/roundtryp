const Tour = require('../models/TourModel')
const catchAsync = require('../utils/CatchAsync')
const handlerBuilder = require('./HandlerBuilder')

exports.getAllTours = handlerBuilder.getAll(Tour)

exports.getTour = handlerBuilder.getOne(Tour, { path: 'reviews' })
exports.createTour = handlerBuilder.createOne(Tour)
exports.updateTour = handlerBuilder.updateOne(Tour)
exports.deleteTour = handlerBuilder.deleteOne(Tour)

//Aggregation Pipelines
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty', //group by 'difficulty' props
        numTours: { $sum: 1 }, //will increment every doc we inspect
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, //used props from the prev stage, not our base data model. 1 asc -1 desc.
    },
  ])

  res.status(200).json({
    message: 'success',
    data: {
      stats,
    },
  })
})

exports.getMonthlyTourSchedule = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  })
})
