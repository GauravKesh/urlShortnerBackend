const mongoose = require('mongoose')
const db = require('../database/db')
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: '30d' }
})

const UrlModel = db.getMainDb().model('UrlModel', urlSchema)

module.exports = UrlModel
