const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/TourModel')
const catchAsync = require('../utils/CatchAsync')
const handlerBuilder = require('./HandlerBuilder')
const AppError = require('../utils/AppError')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(new AppError('Please only upload image file', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 }, //return an array, even though the content only 1 item
  { name: 'images', maxCount: 3 },
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()
  //a. handling imageCover
  //we need to assign the filename to req.body, bcs the updateTour handler takes req.body input for update data
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)

  //b.  handling images
  req.body.images = [] //put the images to the req.body. the schema for 'images' expecting an array

  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 75 })
        .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
    })
  )

  next()
})

exports.getAllTours = handlerBuilder.getAll(Tour)

exports.getTour = handlerBuilder.getOne(Tour, { path: 'reviews' })
exports.createTour = handlerBuilder.createOne(Tour)
exports.updateTour = handlerBuilder.updateOne(Tour)
exports.deleteTour = handlerBuilder.deleteOne(Tour)

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  //create a radian, a mongo variable where distance is divided by earth radius
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  if (!lat || !lng) next(new AppError('Please provide the coordinates', 400))

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  })

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  })
})

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

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if (!lat || !lng) next(new AppError('Please provide the coordinates', 400))

  const tourDistances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      data: tourDistances,
    },
  })
})
