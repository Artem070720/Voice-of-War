const express = require('express')

const {
    updateProfile,
    changePassword,
} = require('../controllers/profile.controller')

const { authMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)

router.patch('/', updateProfile)
router.patch('/password', changePassword)

module.exports = router