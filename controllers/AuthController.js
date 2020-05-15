const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/CatchAsync')
const sendEmail = require('../utils/Email')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ), // convert to ms
    httpOnly: true,
    // secure: true,
  }

  //sent cookie
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)

  //remove password from output (if this function used in user signup)
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // role: req.body.role,
  })

  createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  //a. check if user already input email and pass
  if (!email || !password) {
    return next(new AppError('Please input your email and password', 400))
  }
  //b. check if user STILL EXIST && the password is correct
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.passwordCheck(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  //c. send jwt to client
  createSendToken(user, 200, res)
})

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
  })

  res.status(200).json({ status: 'success' })
}

exports.protect = catchAsync(async (req, res, next) => {
  //a. Check if token exist
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token)
    return next(
      new AppError(
        'You dont have the access because you are not logged in',
        401
      )
    )

  //b. Token verification
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  )

  //c. Check if the user that bear the token still exist
  const currentUser = await User.findById(decodedToken.id)
  if (!currentUser) {
    return next(
      new AppError('The user with this token is no longer exist.', 401)
    )
  }

  //d. check if user changed the password after the token issued
  if (currentUser.isPasswordChanged(decodedToken.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401)
    )
  }

  //e. grant access to protected route
  req.user = currentUser
  res.locals.user = currentUser
  next()
})

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //a. Token verification
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      //b. Check if the user that bear the token still exist
      const currentUser = await User.findById(decodedToken.id)
      if (!currentUser) {
        return next()
      }

      //c. check if user changed the password after the token issued
      if (currentUser.isPasswordChanged(decodedToken.iat)) {
        return next()
      }

      //d. There is a logged in user.
      // set currentUser in variable 'res.locals', so view engine can pick it up
      res.locals.user = currentUser
      return next()
    } catch (error) {
      return next() //for bypassing logout action (because the jwt is invalid), we dont send any error
    }
  }
  next()
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have permission!', 403))
    }

    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //a. Get user from the provided email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with that email', 404))
  }

  //b. Generate reset token
  const resetToken = user.resetPasswordToken()
  await user.save({ validateBeforeSave: false }) //to by-pass schema validator, because we only gives the email in req.body

  //c.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = ` Forgot your email? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this message`
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    })
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email!',
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError(
        'There was an error while sending the email. Try again later',
        500
      )
    )
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  //a. Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  //b. if token hasnt expired && user still exist, set new password
  if (!user) {
    return next(new AppError('Token is invalid or already expired', 404))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetExpires = undefined
  user.passwordResetToken = undefined
  await user.save()

  //c. send JWT to log the user in
  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //a. get user from database
  const user = await User.findById(req.user.id).select('+password')

  //b. check if password is correct
  if (!(await user.passwordCheck(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password input is wrong', 403))
  }

  //c. update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  //d. log user in, send jwt
  createSendToken(user, 200, res)
})
