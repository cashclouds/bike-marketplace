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
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { env } from '../config/env';

const router: Router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

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
      minYear,
      maxYear,
      material,
      wheelSize,
      frameSize,
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

    if (minYear) {
      sql += ` AND year >= $${paramIndex}`;
      params.push(minYear);
      paramIndex++;
    }

    if (maxYear) {
      sql += ` AND year <= $${paramIndex}`;
      params.push(maxYear);
      paramIndex++;
    }

    if (material) {
      sql += ` AND frame_material = $${paramIndex}`;
      params.push(material);
      paramIndex++;
    }

    if (wheelSize) {
      sql += ` AND wheel_size = $${paramIndex}`;
      params.push(wheelSize);
      paramIndex++;
    }

    if (frameSize) {
      sql += ` AND frame_size = $${paramIndex}`;
      params.push(frameSize);
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
      location,
    } = validatedData;

    // Extract seller contact fields from request body
    const seller_phone = req.body.seller_phone || null;
    const seller_telegram = req.body.seller_telegram || null;
    const seller_whatsapp = req.body.seller_whatsapp || null;
    const seller_email = req.body.seller_email || null;

    console.log('Contact fields:', { seller_phone, seller_telegram, seller_whatsapp, seller_email });

    // Upload photos to Cloudinary or use local if not configured
    const uploadedPhotos = [];

    console.log('Cloudinary config:', {
      hasCloudName: !!env.cloudinaryCloudName,
      hasApiKey: !!env.cloudinaryApiKey,
      hasApiSecret: !!env.cloudinaryApiSecret,
    });

    if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
      // Upload to Cloudinary
      for (const file of (req.files as any[] || [])) {
        try {
          console.log('Uploading to Cloudinary:', {
            filename: file.originalname,
            hasBuffer: !!file.buffer,
            bufferSize: file.buffer ? file.buffer.length : 0,
          });
          const url = await uploadToCloudinary(file.buffer, file.originalname);
          console.log('Cloudinary upload success:', url);
          uploadedPhotos.push({
            url,
            filename: file.originalname,
            size: file.size,
          });
        } catch (error) {
          logger.error('Cloudinary upload error:', error as Error);
          console.log('Falling back to local storage for:', file.originalname);
          // Fallback to local storage on error
          uploadedPhotos.push({
            url: `/uploads/${file.filename || file.originalname}`,
            filename: file.filename || file.originalname,
            size: file.size,
          });
        }
      }
    } else {
      // Fallback to local storage if no Cloudinary config
      console.log('No Cloudinary config, using local storage');
      uploadedPhotos.push(
        ...(req.files as any[] || []).map((file: any) => ({
          url: `/uploads/${file.filename}`,
          filename: file.filename,
          size: file.size,
        }))
      );
    }

    console.log('Photos processed:', uploadedPhotos.length);

    if (uploadedPhotos.length === 0) {
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
       (id, user_id, brand_id, model_name, type, year, condition, price, currency, description, location, photos, seller_phone, seller_telegram, seller_whatsapp, seller_email, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
       RETURNING *`,
      [
        listingId,
        req.user?.id,
        brandIdResult, // Use actual brand ID from database or NULL
        model || brand, // Use model if provided, otherwise fallback to brand
        'road', // Default type
        year || null,
        'used', // Default condition
        price,
        'EUR',
        description,
        location,
        JSON.stringify(uploadedPhotos),
        seller_phone,
        seller_telegram,
        seller_whatsapp,
        seller_email,
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
  console.log('========================================');
  console.log('[DELETE] 🗑️ DELETE LISTING REQUEST');
  console.log('[DELETE] Listing ID:', req.params.id);
  console.log('[DELETE] User ID:', req.user?.id);
  console.log('[DELETE] Timestamp:', new Date().toISOString());
  console.log('========================================');

  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      console.error('[DELETE] ❌ No listing ID provided');
      res.status(400).json({ error: 'Listing ID is required' });
      return;
    }

    console.log('[DELETE] Step 1: Fetching listing from DB...');

    // Check if user is the owner
    const listingResult = await query('SELECT user_id, photos FROM listings WHERE id = $1', [id]);

    if (listingResult.rows.length === 0) {
      console.log('[DELETE] ❌ Listing not found in database:', id);
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const listing = listingResult.rows[0];
    console.log('[DELETE] ✅ Listing found');
    console.log('[DELETE]   - Listing owner user_id:', listing.user_id);
    console.log('[DELETE]   - Request user_id:', req.user?.id);
    console.log('[DELETE]   - Match:', listing.user_id === req.user?.id);

    // Check authorization
    if (listing.user_id !== req.user?.id) {
      console.log('[DELETE] ❌ UNAUTHORIZED: User is not the owner');
      res.status(403).json({ error: 'Not authorized to delete this listing' });
      return;
    }

    console.log('[DELETE] ✅ Authorization check passed');
    console.log('[DELETE] Step 2: Deleting related records...');

    try {
      // Delete messages
      console.log('[DELETE]   - Deleting messages...');
      const msgResult = await query('DELETE FROM messages WHERE listing_id = $1', [id]);
      console.log('[DELETE]   ✅ Deleted', msgResult.rowCount, 'messages');
    } catch (e) {
      console.error('[DELETE]   ⚠️ Messages deletion failed (continuing):', (e as any).message);
    }

    try {
      // Delete reviews from transactions
      console.log('[DELETE]   - Deleting reviews from transactions...');
      const txnResult = await query(
        `DELETE FROM reviews WHERE transaction_id IN (SELECT id FROM transactions WHERE listing_id = $1)`,
        [id]
      );
      console.log('[DELETE]   ✅ Deleted', txnResult.rowCount, 'reviews');
    } catch (e) {
      console.error('[DELETE]   ⚠️ Reviews deletion failed (continuing):', (e as any).message);
    }

    try {
      // Delete transactions
      console.log('[DELETE]   - Deleting transactions...');
      const txnDelete = await query('DELETE FROM transactions WHERE listing_id = $1', [id]);
      console.log('[DELETE]   ✅ Deleted', txnDelete.rowCount, 'transactions');
    } catch (e) {
      console.error('[DELETE]   ⚠️ Transactions deletion failed (continuing):', (e as any).message);
    }

    console.log('[DELETE] Step 3: Deleting listing from database...');

    try {
      const deleteResult = await query('DELETE FROM listings WHERE id = $1', [id]);
      console.log('[DELETE] ✅ Listing deleted from database');
      console.log('[DELETE]   - Rows affected:', deleteResult.rowCount);
    } catch (e) {
      console.error('[DELETE] ❌ CRITICAL: Could not delete listing from database');
      console.error('[DELETE] Error:', (e as any).message);
      console.error('[DELETE] Error code:', (e as any).code);
      console.error('[DELETE] Error detail:', (e as any).detail);
      throw e;
    }

    console.log('[DELETE] Step 4: Cleaning up photo files...');

    if (listing.photos) {
      try {
        const photos = JSON.parse(listing.photos);
        console.log('[DELETE]   - Found', photos.length, 'photos to cleanup');

        for (const photo of photos) {
          try {
            if (photo.url && photo.url.includes('cloudinary')) {
              await deleteFromCloudinary(photo.url).catch(e => {
                console.log('[DELETE]   ⚠️ Cloudinary delete failed:', (e as any).message);
              });
              console.log('[DELETE]   ✅ Cloudinary photo deleted:', photo.url.substring(0, 50) + '...');
            } else if (photo.filename) {
              const filePath = path.join(uploadsDir, photo.filename);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('[DELETE]   ✅ Local photo deleted:', photo.filename);
              }
            }
          } catch (photoError) {
            console.log('[DELETE]   ⚠️ Photo cleanup error (non-critical):', (photoError as any).message);
          }
        }
        console.log('[DELETE] ✅ Photo cleanup completed');
      } catch (photoParseError) {
        console.log('[DELETE]   ⚠️ Could not parse photos JSON:', (photoParseError as any).message);
      }
    }

    console.log('========================================');
    console.log('[DELETE] ✅✅✅ SUCCESS: Listing deleted');
    console.log('========================================');

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.log('========================================');
    console.error('[DELETE] ❌❌❌ ERROR OCCURRED');
    console.error('[DELETE] Error type:', typeof error);
    console.error('[DELETE] Error constructor:', (error as any).constructor.name);
    console.error('[DELETE] Error message:', (error as any).message);
    console.error('[DELETE] Error code:', (error as any).code);
    console.error('[DELETE] Error detail:', (error as any).detail);
    console.error('[DELETE] Full error:', error);
    console.log('========================================');

    logger.error('Delete listing error:', error as Error);

    res.status(500).json({
      error: 'Failed to delete listing',
      details: (error as any).message || 'Unknown error',
      code: (error as any).code,
    });
  }
});

export default router;
