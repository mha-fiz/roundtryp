const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/UserModel')
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')
const handlerBuilder = require('./HandlerBuilder')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users')
//   },
//   filename: (req, file, callback) => {
//     //user-userid-timestamp.jpg
//     const fileExtension = file.mimetype.split('/')[1] //we get 'image/jpg' from 'file' obj
//     callback(null, `user-${req.user.id}-${Date.now()}.${fileExtension}`)
//   },
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(new AppError('Please only upload image file', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
  if (!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
})

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

//add middleware so we could still query using getOne, because it uses req.params.id as the search parameter of findById
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

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
  //check if user update their photo
  if (req.file) filteredBody.photo = req.file.filename

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
