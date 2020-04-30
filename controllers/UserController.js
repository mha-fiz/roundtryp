const User = require('../models/UserModel')
const catchAsync = require('../utils/CatchAsync')

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
})

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}
