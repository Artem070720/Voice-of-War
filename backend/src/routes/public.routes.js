const express = require('express')
const { getHomeData } = require('../controllers/public.controller')

const router = express.Router()

router.get('/home', getHomeData)

module.exports = router