// src/api/router/apiRouter.js
const express = require('express')
const { createShortUrl, redirectShortUrl } = require('../controller/apiController.js')

const router = express.Router()

router.post('/shorten', createShortUrl)
router.get('/:shortCode', redirectShortUrl)

module.exports =  router
