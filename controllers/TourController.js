const Tour = require('../models/TourModel')
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const tours = await features.query

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)

  if (!tour) {
    next(new AppError('No tour found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  })
})

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  })
})

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!tour) {
    next(new AppError('No tour found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)

  if (!tour) {
    next(new AppError('No tour found with that ID', 404))
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

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
