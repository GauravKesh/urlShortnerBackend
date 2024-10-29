const crypto = require('crypto')

exports.generateShortCode = () => crypto.randomBytes(3).toString('hex')
