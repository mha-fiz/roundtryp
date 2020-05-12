const dotenv = require('dotenv')
const AppError = require('../utils/AppError')

dotenv.config({ path: '../config.env' })

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401)

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please login again', 401)

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

const sendErrorDev = (err, req, res) => {
  //err for consuming API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })    
  } else {
    //error for no path found while navigating the website
    console.error('ERROR', err)
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong :(',
      msg: err.message
    })
  }

}

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }

    //when in prod, somehow the 'error' variable doesnt hold the message property from the 'err' obj
    error.message = err.message 

    //?DATABASE ERRORS
    //Invalid :id input
    if (error.name === 'CastError') error = handleDBCastError(error)
    //If the unique schema type got duplicated
    if (error.code === 11000) error = handleDBDuplicateFields(error)
    //If the error coming from mongoose validator
    if (error.name === 'ValidationError') error = handleDBValidationError(error)

    //? TOKEN ERRORS
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
    if (error.name === 'TokenExpiredError') error = handleJWTExpired()
    sendErrorProd(error, req, res)
  }
}
