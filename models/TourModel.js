const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input the tour name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'Please input the tour price'],
  },
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
