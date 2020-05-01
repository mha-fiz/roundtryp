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

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  })
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
  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token,
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  //a. Check if token exist
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
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
  next()
})

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
  const token = signToken(user._id)

  res.status(200).json({
    status: 'success',
    token,
  })
})
