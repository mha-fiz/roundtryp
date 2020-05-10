const express = require('express')
const viewController = require('../controllers/ViewController')

const router = express.Router()

router.get('/', viewController.getOverview)
router.get('/tour/:slug', viewController.getTour)

module.exports = router
