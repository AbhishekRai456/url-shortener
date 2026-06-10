const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = 5000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Middleware
app.use(cors());
app.use(express.json());

// ROUTE 1: Create a Short URL
app.post('/api/shorten', async (req, res) => {
    let { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Ensure the URL has http:// or https:// so the redirect works properly
    if (!/^https?:\/\//i.test(originalUrl)) {
        originalUrl = 'http://' + originalUrl;
    }

    try {
        // Generate a random 6-character string for the short code
        const shortCode = crypto.randomBytes(3).toString('hex');

        // Save to database
        const newLink = await prisma.link.create({
            data: {
                originalUrl: originalUrl,
                shortCode: shortCode
            }
        });

        // Construct the dynamic short URL based on the server's host
        const host = req.headers.host;
        const protocol = req.protocol;
        const fullShortUrl = `${protocol}://${host}/${newLink.shortCode}`;

        res.status(201).json({ shortUrl: fullShortUrl, originalUrl: newLink.originalUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while creating short link' });
    }
});

// ROUTE 2: Redirect to the Original URL
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        const link = await prisma.link.findUnique({
            where: { shortCode: shortCode }
        });

        if (link) {
            // Standard HTTP redirect to the original destination
            return res.redirect(link.originalUrl);
        } else {
            return res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});