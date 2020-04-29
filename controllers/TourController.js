const Tour = require('../models/TourModel')
const APIFeatures = require('../utils/APIFeatures')

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      messsage: error,
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}

exports.getMonthlyTourSchedule = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    })
  }
}
