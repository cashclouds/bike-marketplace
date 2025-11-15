import express, { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { logger } from '../config/logger';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// Get user's favorites
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT l.* FROM listings l
       INNER JOIN favorites f ON l.id = f.listing_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user?.id]
    );

    res.json({
      favorites: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error('Get favorites error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      res.status(400).json({ error: 'listing_id is required' });
      return;
    }

    // Check if listing exists
    const listingResult = await query('SELECT id FROM listings WHERE id = $1', [listing_id]);
    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check if already favorited
    const existingFav = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user?.id, listing_id]
    );

    if (existingFav.rows.length > 0) {
      res.status(409).json({ error: 'Already favorited' });
      return;
    }

    // Add to favorites
    const result = await query(
      `INSERT INTO favorites (user_id, listing_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, user_id, listing_id, created_at`,
      [req.user?.id, listing_id]
    );

    logger.info('Added to favorites', {
      userId: req.user?.id,
      listingId: listing_id,
    });

    res.status(201).json({
      message: 'Added to favorites',
      favorite: result.rows[0],
    });
  } catch (error) {
    logger.error('Add to favorites error:', error as Error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:listing_id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listing_id } = req.params;

    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING id',
      [req.user?.id, listing_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }

    logger.info('Removed from favorites', {
      userId: req.user?.id,
      listingId: listing_id,
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    logger.error('Remove from favorites error:', error as Error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

export default router;
