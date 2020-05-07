const mongoose = require('mongoose')
const Tour = require('./TourModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

//set index to prevent duplicate review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

//Static Method (called on the Model)
reviewSchema.statics.calculateAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        totalRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])

  console.log(stats)

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      //'stats' gives us promise in form of an array of one object
      ratingsQuantity: stats[0].totalRating,
      ratingsAverage: stats[0].avgRating,
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })

  next()
})

//NOTE: post MW doesnt have access to next
reviewSchema.post('save', function () {
  //constructor points to the Model
  // cant directly used 'Review' because it is not declared yet in this point of time
  this.constructor.calculateAvgRating(this.tour)
})

//see notes #11-23
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //document that holds the review we want to update/delete
  this.reviewDoc = await this.findOne()
  //the result will be like this:
  /**
   * {_id: xxxxxx, rating: x, review: x, tour: x, user:{_id: x,name: x,photo:x}, createdAt: xxxx, __v: xxx, id: xxx}
   */
  console.log(this.reviewDoc)
  next()
})

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.reviewDoc.constructor.calculateAvgRating(this.reviewDoc.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
