const crypto = require('crypto')
const { userData } = require('../../../../model/userModel')

const generateApiToken = () => {
    return crypto.randomBytes(5).toString('hex') // Generates a 10-character hex token
}
const createApiToken = async (req, res) => {
    try {
        const user = await userData.findById(req.user.id) // Get the user from the request

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Check if user has reached the API limit based on their plan
        const apiLimit = user.plan === 'free' ? 5 : user.plan === 'monthly' ? 10 : 20 // Example limits
        if (user.apis.length >= apiLimit) {
            return res.status(403).json({ message: `API limit of ${apiLimit} reached. Upgrade your plan.` })
        }

        // Generate a new token
        const token = generateApiToken()
        const newApiEntry = { token, expire: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) } // 5 years default expiry

        // Add the new API token to the user's apis array
        user.apis.push(newApiEntry)
        await user.save()

        res.status(201).json({ message: 'API token created successfully', token: newApiEntry })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

module.exports = { createApiToken }
