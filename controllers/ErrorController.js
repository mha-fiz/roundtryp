const dotenv = require('dotenv')
const AppError = require('../utils/AppError')

dotenv.config({ path: '../config.env' })

const handleDBCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDBDuplicateFields = (err) => {
  const errValue = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${errValue}. Please use different value`
  return new AppError(message, 400)
}

const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  //Operational Errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })

    // Programming or other unknown Errors
  } else {
    //1) Log Error
    console.error('Error: ', err)
    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }

    //Invalid :id input
    if (error.name === 'CastError') error = handleDBCastError(error)
    //If the unique schema type got duplicated
    if (error.code === 11000) error = handleDBDuplicateFields(error)
    //If the error coming from mongoose validator
    if (error.name === 'ValidationError') error = handleDBValidationError(error)

    sendErrorProd(error, res)
  }
}
