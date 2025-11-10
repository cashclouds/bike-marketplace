import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { query } from '../config/database';
import { listingLimiter } from '../config/rateLimit';
import { logger } from '../config/logger';
import {
  createListingSchema,
  filterListingsSchema,
  formatValidationErrors,
} from '../config/validation';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

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

// Get all listings with filters
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Валидируем query параметры
    const validatedQuery = filterListingsSchema.parse(req.query);
    const {
      brand_id,
      type,
      minPrice,
      maxPrice,
      year,
      material,
      condition,
      location,
      limit,
      offset,
      search,
    } = validatedQuery;

    let sql = 'SELECT * FROM listings WHERE status = $1';
    const params: any[] = ['active'];
    let paramIndex = 2;

    if (brand_id) {
      sql += ` AND brand_id = $${paramIndex}`;
      params.push(brand_id);
      paramIndex++;
    }

    if (type) {
      sql += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (minPrice) {
      sql += ` AND price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      sql += ` AND price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (year) {
      sql += ` AND year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (material) {
      sql += ` AND material = $${paramIndex}`;
      params.push(material);
      paramIndex++;
    }

    if (condition) {
      sql += ` AND condition = $${paramIndex}`;
      params.push(condition);
      paramIndex++;
    }

    if (location) {
      sql += ` AND location = $${paramIndex}`;
      params.push(location);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (description ILIKE $${paramIndex} OR model_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
    params.push(limit);
    params.push(offset);

    const result = await query(sql, params);

    res.json({
      listings: result.rows,
      count: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    } else {
      logger.error('Get listings error:', error as Error);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }
});

// Get single listing
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.*, u.name as seller_name, u.email as seller_email
       FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.json({ listing: result.rows[0] });
  } catch (error) {
    logger.error('Get listing error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create listing with photos (LOCAL FILE STORAGE)
router.post('/', listingLimiter, authMiddleware, upload.array('photos', 20), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating listing for user:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('Files count:', (req.files as any[] || []).length);

    // Валидируем входные данные
    const validatedData = createListingSchema.parse(req.body);
    console.log('Validation passed:', validatedData);

    const {
      brand,
      model,
      year,
      price,
      description,
    } = validatedData;

    // Get photo URLs from uploaded files
    const photos = (req.files as any[] || []).map((file: any) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));

    console.log('Photos processed:', photos.length);

    if (photos.length === 0) {
      res.status(400).json({
        error: 'At least one photo is required',
      });
      return;
    }

    const listingId = uuidv4();
    console.log('Inserting listing:', { listingId, userId: req.user?.id, brand, model, year, price });

    // Get a valid brand_id from the database, or use a NULL if not found
    let brandIdResult = null;
    try {
      const brandResult = await query(
        'SELECT id FROM brands WHERE name = $1 LIMIT 1',
        [brand]
      );
      if (brandResult.rows.length > 0) {
        brandIdResult = brandResult.rows[0].id;
      }
      console.log('Found brand ID:', brandIdResult);
    } catch (e) {
      console.log('Could not find brand:', brand);
    }

    // Use model if provided, otherwise use brand as model_name
    const result = await query(
      `INSERT INTO listings
       (id, user_id, brand_id, model_name, type, year, condition, price, currency, description, photos, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        listingId,
        req.user?.id,
        brandIdResult, // Use actual brand ID from database or NULL
        model || brand, // Use model if provided, otherwise fallback to brand
        'road', // Default type
        year || null,
        'excellent', // Default condition
        price,
        'EUR',
        description,
        JSON.stringify(photos),
        'active',
      ]
    );

    console.log('Listing created successfully:', result.rows[0].id);

    res.status(201).json({
      message: 'Listing created successfully',
      id: result.rows[0].id,
      listing: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error);
      logger.error('Listing validation error:', error as Error);
      console.error('Validation error details:', errors);
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    } else {
      logger.error('Create listing error:', error as Error);
      console.error('Create listing error details:', (error as any).message);
      res.status(500).json({ error: 'Failed to create listing', details: (error as any).message });
    }
  }
});

// Update listing
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { price, description, condition, location, status } = req.body;

    // Check if user is the owner
    const listingResult = await query('SELECT user_id FROM listings WHERE id = $1', [id]);

    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listingResult.rows[0].user_id !== req.user?.id) {
      res.status(403).json({ error: 'Not authorized to update this listing' });
      return;
    }

    const result = await query(
      `UPDATE listings
       SET price = COALESCE($1, price),
           description = COALESCE($2, description),
           condition = COALESCE($3, condition),
           location = COALESCE($4, location),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [price || null, description || null, condition || null, location || null, status || null, id]
    );

    res.json({
      message: 'Listing updated successfully',
      listing: result.rows[0],
    });
  } catch (error) {
    logger.error('Update listing error:', error as Error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is the owner
    const listingResult = await query('SELECT user_id, photos FROM listings WHERE id = $1', [id]);

    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listingResult.rows[0].user_id !== req.user?.id) {
      res.status(403).json({ error: 'Not authorized to delete this listing' });
      return;
    }

    // Delete associated photo files
    if (listingResult.rows[0].photos) {
      const photos = JSON.parse(listingResult.rows[0].photos);
      photos.forEach((photo: any) => {
        const filePath = path.join(uploadsDir, photo.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await query('DELETE FROM listings WHERE id = $1', [id]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    logger.error('Delete listing error:', error as Error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

export default router;
