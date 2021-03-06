const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const cors = require('cors')

const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/ErrorController')
const tourRouter = require('./routes/TourRoutes')
const userRouter = require('./routes/UserRoutes')
const reviewRouter = require('./routes/ReviewRoutes')
const viewRouter = require('./routes/ViewRoutes')
const bookingRouter = require('./routes/BookingRoutes')
const bookingController = require('./controllers/BookingController')

const app = express()

//set the view engine & template location
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) App-Level Middleware
app.use(cors())
app.options('*', cors())
app.use(express.static(path.join(__dirname, 'public')))

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
})

app.use('/api', limiter)

//for stripe checkout. stripe webhook only allow data sent in raw form, not JSON
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'maxGroupSize',
      'price',
    ],
  })
)

app.use(compression())

//test mw
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies)
  next()
})

// 2) Routes

//View Engine Routes
app.use('/', viewRouter)

//API Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

//  2.1) Handle undefined routes

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
