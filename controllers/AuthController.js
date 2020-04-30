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
