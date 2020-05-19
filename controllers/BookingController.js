const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/TourModel')
const Booking = require('../models/BookingModel')
const catchAsync = require('../utils/CatchAsync')
const handlerBuilder = require('./HandlerBuilder')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // a.   Get the tour that we booked
  const tour = await Tour.findById(req.params.tourId)

  // b.   Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //temporary success url before deploy
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  })

  // c.   Create session as response
  res.status(200).json({
    status: 'success',
    session,
  })
})

//temporary MW handler before deploy. used in home of viewroute, bcs that's the route that the success_url hit
//the objective is to put the booking to the DB
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query //query str in success_url

  if (!tour && !user && !price) return next()

  await Booking.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = handlerBuilder.createOne(Booking)
exports.getBooking = handlerBuilder.getOne(Booking)
exports.getAllBookings = handlerBuilder.getAll(Booking)
exports.updateBooking = handlerBuilder.updateOne(Booking)
exports.deleteBooking = handlerBuilder.deleteOne(Booking)
