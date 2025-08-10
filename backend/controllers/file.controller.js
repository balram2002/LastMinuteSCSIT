import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import mongoose from "mongoose";
import { File } from '../models/FileModel.js';
import axios from 'axios';

const API_URL = "https://lastminutescsit-api.vercel.app";
// const API_URL = "http://localhost:5000";

export const uploadFile = async (req, res) => {
  try {
    let {
      name,
      course,
      semester,
      subject,
      types,
      year,
      category,
      uploadedBy,
      fileUrl,
      contentType,
      format
    } = req.body;

    // Quick fix for invalid MIME types
if (contentType === 'image/pdf' || (contentType === 'image' && format === 'pdf')) {
  contentType = 'raw';
  format = 'pdf';
}

    // Check if file URL exists
    if (!fileUrl || typeof fileUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'No file URL provided'
      });
    }

    // Validate required fields
    if (!name || !course || !semester || !subject || !types || !year || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Normalize and validate year
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year format'
      });
    }

    // Improved content type resolution
    let resolvedContentType;
    
    // Handle different Cloudinary response formats
    if (contentType === 'image' || (contentType && contentType.startsWith('image'))) {
      // For images
      if (format) {
        resolvedContentType = `image/${format}`;
      } else {
        resolvedContentType = contentType.startsWith('image') ? contentType : 'image/jpeg';
      }
    } else if (contentType === 'raw' || contentType === 'application/pdf') {
      // For PDFs (Cloudinary returns 'raw' for PDFs)
      if (format === 'pdf' || contentType === 'application/pdf') {
        resolvedContentType = 'application/pdf';
      } else {
        resolvedContentType = 'application/octet-stream';
      }
    } else {
      // Fallback: try to determine from format
      if (format === 'pdf') {
        resolvedContentType = 'application/pdf';
      } else if (format && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(format.toLowerCase())) {
        resolvedContentType = `image/${format}`;
      } else {
        resolvedContentType = 'application/octet-stream';
      }
    }

    console.log('Content type resolution:', {
      original_contentType: contentType,
      format: format,
      resolved: resolvedContentType
    });

    // Validate file type - Updated allowed types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(resolvedContentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type: ${resolvedContentType}. Only PDF, JPG, PNG, GIF, WEBP are allowed`
      });
    }

    // Validate 'types' field
    const validTypes = ['image', 'document'];
    if (typeof types !== 'string' || !validTypes.includes(types.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Must be "image" or "document"'
      });
    }

    // Additional validation: ensure PDFs are marked as documents
    if (resolvedContentType === 'application/pdf' && types.toLowerCase() !== 'document') {
      return res.status(400).json({
        success: false,
        message: 'PDF files must be marked as "document" type'
      });
    }

    // Additional validation: ensure images are marked correctly
    if (resolvedContentType.startsWith('image/') && types.toLowerCase() !== 'image') {
      return res.status(400).json({
        success: false,
        message: 'Image files must be marked as "image" type'
      });
    }

    // Save file to DB
    const newFile = new File({
      name,
      type: types.toLowerCase(),
      course,
      subject,
      semester,
      year,
      isFree: 'free',
      fileUrl,
      contentType: resolvedContentType,
      category,
      uploadedBy: uploadedBy || "anonymous",
      format: format || (resolvedContentType === 'application/pdf' ? 'pdf' : 'unknown')
    });

    await newFile.save();

    res.status(200).json({
      success: true,
      message: 'File saved successfully',
      data: {
        fileId: newFile._id,
        name,
        course,
        semester,
        subject,
        year,
        types: types.toLowerCase(),
        url: fileUrl,
        format: format || (resolvedContentType === 'application/pdf' ? 'pdf' : 'unknown'),
        category,
        contentType: resolvedContentType
      },
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
};

export const fetchFilesCourseAndSemester = async (req, res) => {
  try {
    const { course, semester } = req.body;

    if (!course || !semester) {
      return res.status(400).json({ success: false, message: 'Course and semester are required' });
    }

    const semesterNum = parseInt(semester, 10);
    if (isNaN(semesterNum) || semesterNum < 1) {
      return res.status(400).json({ success: false, message: 'Invalid semester value' });
    }

    const files = await File.find({ course, semester: semesterNum })
      .select('name type course subject semester year fileUrl category contentType format')
      .lean();

    if (!files.length) {
      return res.status(200).json({
        success: true,
        message: 'No files found for the specified course and semester',
        data: [],
      });
    }

    const modifiedFiles = files.map(file => {
      if (file.type === "document" && file.fileUrl && file.fileUrl.includes('cloudinary.com')) {
        if (file.contentType === 'application/pdf' || file.format === 'pdf') {
          const urlParts = file.fileUrl.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            const afterUpload = urlParts.slice(uploadIndex + 1).join('/');
            const publicId = afterUpload.replace(/\.[^/.]+$/, '');
            const cloudName = file.fileUrl.match(/https:\/\/res\.cloudinary\.com\/([^\/]+)/)?.[1];
            
            if (cloudName) {
              return {
                ...file,
                fileUrl: `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment:inline/${publicId}.pdf`
              };
            }
          }
          
          if (file.fileUrl.includes('/upload/')) {
            return {
              ...file,
              fileUrl: file.fileUrl.replace('/upload/', '/upload/fl_attachment:inline/')
            };
          }
        }
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });
  } catch (err) {
    console.error('Fetch files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch files', error: err.message });
  }
};

export const proxyPdf = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const response = await axios.get(url, { responseType: 'stream' });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch file', error: error.message });
  }
};

export const fetchAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }).lean();

    const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `${API_URL}/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`
        };
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });

  } catch (err) {
    console.error('Fetch all files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch all files', error: err.message });
  }
};

export const fetchAdminFiles = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const files = await File.find({ uploadedBy: userId }).sort({ createdAt: -1 }).lean();;

      const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `${API_URL}/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`
        };
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });

  } catch (err) {
    console.error('Fetch admin files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin files', error: err.message });
  }
};

export const fetchfileById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'File ID is required' });
    }

    const file = await File.findById(id).lean();

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.type === "document") {
      file.fileUrl = `${API_URL}/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`;
    }

    res.status(200).json({
      success: true,
      message: 'File retrieved successfully',
      data: file,
    });

  } catch (err) {
    console.error('Fetch file by ID error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch file', error: err.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { id } = req.body;
    const { name, year } = req.body;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid file ID' });
    }

    if (!name || !year) {
      return res.status(400).json({ success: false, message: 'Name and year are required' });
    }

    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ success: false, message: 'Invalid year format' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User not authorized to edit this file' });
    }

    file.name = name;
    file.year = year;

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      data: file,
    });
  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ success: false, message: 'Failed to update file', error: err.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.body;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this file' });
    }

    // Delete from Cloudinary
    if (file.public_id) {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: file.resource_type
      });
    }

    // Delete from MongoDB
    await File.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete file', error: err.message });
  }
};
