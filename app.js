const express = require('express')
const morgan = require('morgan')

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

// 3) Starting the Server

module.exports = app
