const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input the tour name'],
    unique: true,
    trim: true,
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
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
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
  priceDiscount: Number,
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
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
