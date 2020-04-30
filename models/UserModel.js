const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please input a name'],
  },
  email: {
    type: String,
    required: [true, 'Please input an email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this kind of validator only works on NEW doc creation
      validator: function (value) {
        return value === this.password
      },
      message: 'Password did not match!',
    },
  },
  passwordChangedAt: Date,
})

//hashing password, not persist passwordConfirm
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.methods.passwordCheck = async function (passwordInput, dbPassword) {
  return await bcrypt.compare(passwordInput, dbPassword)
}

userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const convertTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < convertTimestamp
  }

  return false
}

const User = mongoose.model('User', userSchema)

module.exports = User
