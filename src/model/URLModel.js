const mongoose = require('mongoose')
const db = require('../database/db')
const {model} = mongoose
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '30d' }
})

// Create the model using the schema
const UrlModel = db.getMainDb().model('UrlModel', urlSchema)

module.exports = UrlModel
