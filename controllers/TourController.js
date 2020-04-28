const Tour = require('../models/TourModel')

exports.getAllTours = async (req, res) => {
  try {
    //*  (#1) ##### Filtering

    //  #1a Basic Filtering
    const queryObj = { ...req.query } //from url
    const excludedFields = ['page', 'sort', 'limit', 'fields'] //query string we want to remove from queryObj
    excludedFields.forEach((el) => delete queryObj[el]) //delete the excluded keyword from the queryObj

    //  #1b Advance Filtering
    let queryStr = JSON.stringify(queryObj) //ex: { "duration": {"gte": "10"} }

    queryStr = queryStr.replace(
      /\b(gte|gte|lte|lt)\b/g,
      (matchedKeyword) => `$${matchedKeyword}`
    ) //{ "duration": {"$gte": "10"} } the $ sign was added

    console.log(JSON.parse(queryStr))
    // ex: { duration: { '$gte': '10'} } --> now we can query this

    let query = Tour.find(JSON.parse(queryStr)) // we are not 'await' this bsc we only want to returned the Query object

    //*   (#2) ##### Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    //*   (#3) Limiting output fields

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      query.select('-__v') //excluding the mongoose property
    }

    //*   (#4) Pagination

    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 100
    const skippedDocs = (page - 1) * limit

    query = query.skip(skippedDocs).limit(limit)

    if (req.query.page) {
      const tourTotal = await Tour.countDocuments()
      if (skippedDocs >= tourTotal) {
        throw new Error('Page you requested didnt exist!')
      }
    }

    //*   EXECUTE the final form of query
    const tours = await Tour.find(query) // we execute the query, returned us the corresponding Document

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
