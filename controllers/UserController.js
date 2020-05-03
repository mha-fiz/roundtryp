const User = require('../models/UserModel')
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')

const filterObj = (obj, ...allowedFields) => {
  const filtered = {}

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      filtered[el] = obj[el]
    }
  })

  return filtered
}

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

//for user
exports.updateMe = catchAsync(async (req, res, next) => {
  //a. Throw an error if user try to change pass in this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cant change password here. Please use the /updateMyPassword instead',
        400
      )
    )
  }

  //b. Filter unwanted input in request body
  const filteredBody = filterObj(req.body, 'email', 'name')

  //c. Update the user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  //d. send response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

//for admin
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}

//not really deleting user, just marked it as 'inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available yet',
  })
}
