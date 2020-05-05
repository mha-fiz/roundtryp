const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./UserModel')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please input the tour name'],
      unique: true,
      trim: true,
      maxlength: [25, 'You can only input 25 characters'],
      minlength: [10, 'Please input minimal 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Please input the tour durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Please input the maximum group size for the tour'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please input the tour difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be between 1 - 5'],
      max: [5, 'Max rating is 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, 'Please input the tour price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this kind of validator only works on NEW doc creation
        validator: function (value) {
          return value < this.price
        },
        message:
          'The discounted price ({VALUES}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Please input the tour summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //embed new doc by creating an array with object
    locations: [
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

//create index(es)
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })

tourSchema.virtual('durationInWeek').get(function () {
  return Math.ceil(this.duration / 7)
})

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //part of other model schema we want to get
  localField: '_id', //what we want to call it in the current model
})

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' })
  next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
