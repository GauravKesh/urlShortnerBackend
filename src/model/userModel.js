const mongoose = require('mongoose')
const { Schema } = mongoose
const { getMainDb } = require('../database/db')

const planLimits = {
    free: 5,
    monthly: 50,
    yearly: 100,
    'multi-year': 200
}

// Helper function to calculate renewal date based on plan
function calculateRenewalDate(plan) {
    const now = new Date()
    switch (plan) {
        case 'monthly':
            return new Date(now.setMonth(now.getMonth() + 1))
        case 'yearly':
            return new Date(now.setFullYear(now.getFullYear() + 1))
        case 'multi-year':
            return new Date(now.setFullYear(now.getFullYear() + 3))
        default:
            return null // No renewal date for free plan
    }
}

const UserModel = new Schema({
    name: { type: String, required: true },
    username: { type: String,required: true, unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    isVerified: { type: Boolean, default: false }, // Email verification status
    lastLogin: { type: Date }, // Track last login
    profilePicture: { type: String }, // URL to user's profile picture
    bio: { type: String }, // Short description of the user
    apis: [
        {
            token: {
                type: String,
                required: true,
                minlength: 10,
                maxlength: 10
                // validate: {
                //     validator: function (v) {
                //         return v.length === 10 // Ensure the length is exactly 10
                //     },
                //     message: 'Token must be exactly 10 characters.'
                // }
            },
            expire: { type: Date, default: () => new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) } // 5 years default expiry
        }
    ],
    plan: {
        type: String,
        enum: ['free', 'monthly', 'yearly', 'multi-year'],
        required: true,
        default: 'free'
    },
    renewalDate: {
        type: Date,
        default: function () {
            return calculateRenewalDate(this.plan)
        }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

// Hook to enforce API limit and update `updated_at` and `renewalDate` before saving
UserModel.pre('save', function (next) {
    this.updated_at = Date.now()
    const maxApis = planLimits[this.plan]
    if (this.apis.length > maxApis) {
        return next(new Error(`Exceeded maximum API limit of ${maxApis} for the ${this.plan} plan.`))
    }
    if (this.plan !== 'free' && !this.renewalDate) {
        this.renewalDate = calculateRenewalDate(this.plan)
    }

    next()
})

// Method to check and update plan based on renewal date
UserModel.methods.checkAndUpdatePlan = function () {
    const now = new Date()
    if (this.plan !== 'free' && this.renewalDate < now) {
        this.plan = 'free'
        this.renewalDate = null
        this.apis = []
    }
}

const userData = getMainDb().model('userData', UserModel)

module.exports = { userData }
