const express = require('express')
const userController = require('../controllers/UserController')
const authController = require('../controllers/AuthController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)

router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

//starting here, every route needs to be protected (only for logged in user)
router.use(authController.protect)

router.patch('/updateMyPassword', authController.updatePassword)

router.route('/me').get(userController.getMe, userController.getUser)

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
)
router.delete('/deleteMe', userController.deleteMe)

//starting here, the routes restricted for administrator only
router.use(authController.restrictTo('admin'))

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
