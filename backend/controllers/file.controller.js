import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
    });

    fs.unlinkSync(req.file.path); 

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        asset_id: result.asset_id,
      },
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};
