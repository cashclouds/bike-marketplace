import compression, { CompressionOptions } from 'compression';

/**
 * Response Compression Configuration
 * Enables gzip compression for API responses to reduce bandwidth
 */

export const compressionOptions: CompressionOptions = {
  // Compress if response is larger than 1KB
  threshold: 1024,

  // Compression level (0-9, 6 is default, higher = better compression but slower)
  // Using 6 (default) for good balance between compression ratio and speed
  level: 6,

  // Custom filter to decide which responses to compress
  filter: (req, res) => {
    // Don't compress if client doesn't accept gzip
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress streaming responses or file downloads
    const contentType = res.getHeader('content-type');
    if (contentType && typeof contentType === 'string') {
      // Don't compress already compressed formats
      if (
        contentType.includes('image') ||
        contentType.includes('video') ||
        contentType.includes('zip') ||
        contentType.includes('gzip')
      ) {
        return false;
      }
    }

    // Use default compression filter (checks Accept-Encoding header)
    return compression.filter(req, res);
  },
};

export const compressionMiddleware = compression(compressionOptions);
