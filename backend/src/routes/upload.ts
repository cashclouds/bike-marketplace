import express, { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadLimiter } from '../config/rateLimit';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  },
});

// Upload single image
router.post('/upload', uploadLimiter, authMiddleware, upload.single('image'), (req: AuthRequest, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    res.json({
      message: 'Image uploaded successfully',
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple images
router.post('/upload-multiple', uploadLimiter, authMiddleware, upload.array('images', 10), (req: AuthRequest, res: Response): void => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const urls = (req.files as any[]).map((file: any) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.json({
      message: 'Images uploaded successfully',
      urls,
      count: urls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete image
router.delete('/delete/:filename', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
