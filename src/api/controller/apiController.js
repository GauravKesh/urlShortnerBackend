const Url = require('../../model/URLModel.js')
const { generateShortCode } = require('../../util/generateShortCode.js')
const logger = require('../../util/logger.js')

exports.createShortUrl = async (req, res) => {
    const { originalUrl } = req.body

    if (!originalUrl) {
        res.status(400).json({ message: 'Original URL is required' })
    }
    try {
        // Generate a unique short code
        const shortCode = generateShortCode()
        const url = new Url({ originalUrl, shortCode })
        await url.save()

        logger.info(`Shortened URL created: ${originalUrl} -> ${shortCode}`)
        // res.status(201).json({ shortUrl: `${req.headers.host}/api/v1/${shortCode}` })
        res.status(201).json({ shortUrl: `${shortCode}` })
    } catch (error) {
        logger.error('Error creating shortened URL:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

exports.redirectShortUrl = async (req, res) => {
    const { shortCode } = req.params // Retrieve short code from URL params
    console.log('Received short code:', shortCode)

    try {
        const url = await Url.findOne({ shortCode })
        if (url) {
            await Url.updateOne({ shortCode }, { $inc: { clicks: 1 } })
            logger.info(`Found original URL for short code ${shortCode}: ${url.originalUrl}`)
            return res.status(200).json({ originalUrl: url.originalUrl })
        } else {
            logger.warn(`Short code not found: ${shortCode}`)
            return res.status(404).json({ message: 'URL not found' })
        }
    } catch (error) {
        logger.error('Error redirecting to URL:', error)
        return res.status(500).json({ message: 'Server error' })
    }
}
