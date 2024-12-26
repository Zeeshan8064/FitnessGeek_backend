const express = require('express');
const router = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/uploadimage', upload.single('myimage'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ ok: false, error: 'No image file provided' });
    }

    try {
        // Upload the image directly to Cloudinary without using sharp
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                if (error) {
                    reject(new Error('Cloudinary Upload Error: ' + error));
                } else {
                    resolve(result);
                }
            }).end(file.buffer); // Use the file buffer directly
        });

        // Respond with the image URL
        res.json({ ok: true, imageUrl: result.url, message: 'Image uploaded successfully' });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ ok: false, error: 'Error uploading image' });
    }
});

module.exports = router;
