const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/CatchAsync')

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
