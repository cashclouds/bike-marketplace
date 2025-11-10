import express, { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { logger } from '../config/logger';

const router: Router = express.Router();

// Get all brands
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, name, logo_url FROM brands ORDER BY name ASC');

    res.json({
      brands: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error('Get brands error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get single brand
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('SELECT id, name, logo_url FROM brands WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    res.json({ brand: result.rows[0] });
  } catch (error) {
    logger.error('Get brand error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Get brand models
router.get('/:id/models', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, brand_id, name, type, frame_materials, years_available FROM models WHERE brand_id = $1 ORDER BY name ASC',
      [id]
    );

    res.json({
      models: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error('Get brand models error:', error as Error);
    res.status(500).json({ error: 'Failed to fetch brand models' });
  }
});

export default router;
