const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')
const APIFeatures = require('../utils/APIFeatures')

exports.deleteOne = (DBModel) => {
  return catchAsync(async (req, res, next) => {
    const document = await DBModel.findByIdAndDelete(req.params.id)

    if (!document) {
      next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })
}

exports.updateOne = (DBModel) => {
  return catchAsync(async (req, res, next) => {
    const document = await DBModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!document) {
      next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })
}

exports.createOne = (DBModel) => {
  return catchAsync(async (req, res, next) => {
    const document = await DBModel.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })
}

exports.getOne = (DBModel, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = DBModel.findById(req.params.id)
    if (populateOptions) query = query.populate(populateOptions)

    const document = await query

    if (!document) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    })
  })
}

exports.getAll = (DBModel) => {
  return catchAsync(async (req, res, next) => {
    //first 2 lines is only for review route. to allow nested GET reviews on tour
    let filterId = {}
    if (req.params.tourId) filterId = { tour: req.params.tourId }

    const features = new APIFeatures(DBModel.find(filterId), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const document = await features.query

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: document.length,
      data: {
        data: document,
      },
    })
  })
}
