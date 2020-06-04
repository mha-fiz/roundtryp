const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/TourModel')
const User = require('../models/UserModel')
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
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
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

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id
  const user = (await User.findOne({ email: session.customer_email })).id //we only want the id, not the entire doc
  const price = session.display_items[0].amount / 100
  await Booking.create({ tour, user, price })
}

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return res.status(400).send(`webhook error: ${error.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object)
  }

  res.status(200).json({ received: true })
}

//temporary MW handler before deploy. used in home of viewroute, bcs that's the route that the success_url hit
//the objective is to put the booking to the DB
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query //query str in success_url

//   if (!tour && !user && !price) return next()

//   await Booking.create({ tour, user, price })

//   res.redirect(req.originalUrl.split('?')[0])
// })

exports.createBooking = handlerBuilder.createOne(Booking)
exports.getBooking = handlerBuilder.getOne(Booking)
exports.getAllBookings = handlerBuilder.getAll(Booking)
exports.updateBooking = handlerBuilder.updateOne(Booking)
exports.deleteBooking = handlerBuilder.deleteOne(Booking)
