const express = require('express')
const userController = require('../controllers/UserController')
const authController = require('../controllers/AuthController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)

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
