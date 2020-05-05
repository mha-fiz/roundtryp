const User = require('../models/UserModel')
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')
const handlerBuilder = require('./HandlerBuilder')

const filterObj = (obj, ...allowedFields) => {
  const filtered = {}

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      filtered[el] = obj[el]
    }
  })

  return filtered
}

exports.getAllUsers = handlerBuilder.getAll(User)
exports.getUser = handlerBuilder.getOne(User)

//for admin (dont update password here)
exports.updateUser = handlerBuilder.updateOne(User)
exports.deleteUser = handlerBuilder.deleteOne(User)

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not available, please use /signup instead!',
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

//not really deleting user, just marked it as 'inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})
