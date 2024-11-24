const bcrypt = require('bcryptjs')
const { userData } = require('../models/userModel')

// User registration controller
const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        // Check if user already exists
        const existingUser = await userData.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = new userData({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()
        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}


module.exports = {registerUser};
