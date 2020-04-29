const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/ErrorController')
const tourRouter = require('./routes/TourRoutes')
const userRouter = require('./routes/UserRoutes')

const app = express()

// 1) App-Level Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

//  2.1) Handle undefined routes

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
