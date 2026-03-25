const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

/**
 * Cloudinary Configuration for File Uploads
 * Handles image, video, audio, and document uploads
 */

class CloudinaryService {
  constructor() {
    this.isConfigured = false;
    this.config = null;
  }

  /**
   * Initialize Cloudinary with credentials
   */
  initialize() {
    try {
      // Check if credentials are provided
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.warn('⚠️  Cloudinary credentials not found. File uploads will use local storage.');
        this.isConfigured = false;
        return false;
      }

      // Configure Cloudinary
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true, // Use HTTPS
      });

      this.isConfigured = true;
      this.config = {
        cloud_name: cloudName,
        api_key: apiKey.slice(0, 4) + '...', // Hide part of API key
      };

      console.log('✅ Cloudinary configured successfully');
      console.log(`   Cloud Name: ${cloudName}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Cloudinary configuration failed:', error.message);
      this.isConfigured = false;
      return false;
    }
  }

  /**
   * Upload file to Cloudinary
   * @param {string} filePath - Local file path
   * @param {Object} options - Upload options
   */
  async uploadFile(filePath, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured. Please check your credentials.');
    }

    try {
      // Default options
      const uploadOptions = {
        resource_type: 'auto', // Automatically detect file type
        folder: options.folder || 'task_manager',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options
      };

      // Set specific options based on file type
      const fileExtension = path.extname(filePath).toLowerCase();
      const mimeType = this.getMimeType(fileExtension);
      
      if (mimeType.startsWith('image/')) {
        uploadOptions.resource_type = 'image';
        uploadOptions.transformation = [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ];
      } else if (mimeType.startsWith('video/')) {
        uploadOptions.resource_type = 'video';
        uploadOptions.eager = [
          { streaming_profile: 'hd', format: 'mp4' },
          { width: 300, height: 200, crop: 'fill', format: 'jpg' }
        ];
      } else if (mimeType.startsWith('audio/')) {
        uploadOptions.resource_type = 'video'; // Audio is treated as video
      } else if (mimeType === 'application/pdf') {
        uploadOptions.resource_type = 'raw';
      }

      console.log(`📤 Uploading file to Cloudinary: ${path.basename(filePath)}`);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      
      console.log(`✅ File uploaded successfully: ${result.secure_url}`);
      
      // Clean up local file after upload
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Local file deleted: ${filePath}`);
      } catch (err) {
        console.warn(`⚠️  Could not delete local file: ${err.message}`);
      }
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        size: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        originalFilename: result.original_filename,
        createdAt: result.created_at
      };
      
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('invalid api_key')) {
        throw new Error('Invalid Cloudinary API key. Please check your credentials.');
      } else if (error.message.includes('invalid signature')) {
        throw new Error('Invalid Cloudinary API secret. Please check your credentials.');
      } else if (error.message.includes('File too large')) {
        throw new Error('File too large. Maximum size is 50MB.');
      } else if (error.message.includes('Unsupported file type')) {
        throw new Error('Unsupported file type. Please upload images, videos, audio, or PDF files.');
      }
      
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @param {string[]} filePaths - Array of local file paths
   * @param {Object} options - Upload options
   */
  async uploadMultipleFiles(filePaths, options = {}) {
    const uploadPromises = filePaths.map(filePath => this.uploadFile(filePath, options));
    const results = await Promise.allSettled(uploadPromises);
    
    const uploaded = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    const failed = results
      .filter(r => r.status === 'rejected')
      .map(r => ({ error: r.reason.message }));
    
    return {
      success: uploaded.length,
      failed: failed.length,
      files: uploaded,
      errors: failed
    };
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   */
  async deleteFile(publicId) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured. Please check your credentials.');
    }

    try {
      console.log(`🗑️  Deleting file from Cloudinary: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`✅ File deleted successfully: ${publicId}`);
        return { success: true, publicId };
      } else {
        throw new Error(`Failed to delete: ${result.result}`);
      }
      
    } catch (error) {
      console.error('❌ Cloudinary delete failed:', error.message);
      throw error;
    }
  }

  /**
   * Get file URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Cloudinary transformations
   */
  getUrl(publicId, transformations = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }
    
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
  }

  /**
   * Generate thumbnail URL
   * @param {string} publicId - Cloudinary public ID
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   */
  getThumbnail(publicId, width = 300, height = 200) {
    return this.getUrl(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }

  /**
   * Get video thumbnail URL
   * @param {string} publicId - Cloudinary public ID
   * @param {number} time - Time in seconds
   */
  getVideoThumbnail(publicId, time = 5) {
    return this.getUrl(publicId, {
      resource_type: 'video',
      transformation: [
        { start_offset: time },
        { width: 300, height: 200, crop: 'fill', format: 'jpg' }
      ]
    });
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Check if Cloudinary is configured
   */
  isConfigured() {
    return this.isConfigured;
  }

  /**
   * Get configuration info (safe for logging)
   */
  getConfig() {
    return this.config;
  }
}

// Create and export a singleton instance
const cloudinaryService = new CloudinaryService();

// Initialize on import
cloudinaryService.initialize();

module.exports = cloudinaryService;